create or replace function private.notify_pulse_reaction()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  media_record public.pulse_media%rowtype;
  destination_route text;
  notification_key text;
begin
  if tg_op = 'INSERT' then
    select *
    into media_record
    from public.pulse_media
    where id = new.media_id;

    if media_record.id is null
       or media_record.author_id = new.user_id then
      return new;
    end if;

    destination_route :=
      case
        when media_record.kind in ('clip', 'moment', 'wave') then 'clips'
        else 'watch'
      end;

    notification_key :=
      'pulse-like:' || new.media_id::text || ':' || new.user_id::text;

    insert into public.notifications (
      user_id, actor_id, type, title, body, route, payload, group_key
    )
    values (
      media_record.author_id,
      new.user_id,
      'like',
      'Нова реакція у PULSE',
      coalesce(nullif(media_record.title, ''), 'Ваше відео') || ' вподобали',
      destination_route,
      jsonb_build_object(
        'videoId', media_record.id,
        'pulseMediaId', media_record.id,
        'kind', media_record.kind
      ),
      notification_key
    );

    return new;
  end if;

  if tg_op = 'DELETE' then
    delete from public.notifications
    where actor_id = old.user_id
      and group_key =
        'pulse-like:' || old.media_id::text || ':' || old.user_id::text;

    return old;
  end if;

  return null;
end;
$$;

revoke all on function private.notify_pulse_reaction()
from public, anon, authenticated;

drop trigger if exists notify_pulse_reaction on public.pulse_reactions;
create trigger notify_pulse_reaction
after insert or delete on public.pulse_reactions
for each row execute function private.notify_pulse_reaction();

create or replace function private.notify_pulse_comment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  media_record public.pulse_media%rowtype;
  destination_route text;
  parent_author uuid;
  body_text text;
begin
  select *
  into media_record
  from public.pulse_media
  where id = new.media_id;

  if media_record.id is null then
    return new;
  end if;

  destination_route :=
    case
      when media_record.kind in ('clip', 'moment', 'wave') then 'clips'
      else 'watch'
    end;

  body_text :=
    left(
      regexp_replace(
        btrim(new.text),
        E'[\n\r]+',
        ' ',
        'g'
      ),
      180
    );

  if media_record.author_id <> new.author_id then
    insert into public.notifications (
      user_id, actor_id, type, title, body, route, payload, group_key
    )
    values (
      media_record.author_id,
      new.author_id,
      'comment',
      'Новий коментар у PULSE',
      body_text,
      destination_route,
      jsonb_build_object(
        'videoId', media_record.id,
        'pulseMediaId', media_record.id,
        'commentId', new.id,
        'openComments', true,
        'kind', media_record.kind
      ),
      'pulse-comment:' || new.id::text
    );
  end if;

  if new.parent_id is not null then
    select author_id
    into parent_author
    from public.pulse_comments
    where id = new.parent_id;

    if parent_author is not null
       and parent_author <> new.author_id
       and parent_author <> media_record.author_id then
      insert into public.notifications (
        user_id, actor_id, type, title, body, route, payload, group_key
      )
      values (
        parent_author,
        new.author_id,
        'reply',
        'Нова відповідь у PULSE',
        body_text,
        destination_route,
        jsonb_build_object(
          'videoId', media_record.id,
          'pulseMediaId', media_record.id,
          'commentId', new.id,
          'parentCommentId', new.parent_id,
          'openComments', true,
          'kind', media_record.kind
        ),
        'pulse-reply:' || new.id::text
      );
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.notify_pulse_comment()
from public, anon, authenticated;

drop trigger if exists notify_pulse_comment on public.pulse_comments;
create trigger notify_pulse_comment
after insert on public.pulse_comments
for each row execute function private.notify_pulse_comment();

create or replace function private.cleanup_pulse_comment_notifications()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.notifications
  where group_key in (
    'pulse-comment:' || old.id::text,
    'pulse-reply:' || old.id::text
  );

  return old;
end;
$$;

revoke all on function private.cleanup_pulse_comment_notifications()
from public, anon, authenticated;

drop trigger if exists cleanup_pulse_comment_notifications on public.pulse_comments;
create trigger cleanup_pulse_comment_notifications
after delete on public.pulse_comments
for each row execute function private.cleanup_pulse_comment_notifications();
