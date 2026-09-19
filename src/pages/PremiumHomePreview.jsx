import {
  useState,
} from "react";

import {
  Bell,
  Bookmark,
  MessageCircle,
  Moon,
  Plus,
  Search,
} from "lucide-react";

import HomePage from "./HomePage";
import PulsePage from "./PulsePage";
import ClipsPage from "./ClipsPage";
import WatchPage from "./WatchPage";
import LivePage from "./LivePage";
import CityPulsePage from "./CityPulsePage";
import CreatorProfilePage from "./CreatorProfilePage";
import CreatorStudioPage from "./CreatorStudioPage";

import ProfilePage from "./ProfilePage";
import NowPage from "./NowPage";

import NearbyPulsePage from "./NearbyPulsePage";
import EventsPulsePage from "./EventsPulsePage";

import CreateHubPage from "./CreateHubPage";
import CreateMediaPage from "./CreateMediaPage";

import Friends from "../components/Friends";
import SearchPage from "../components/Search";
import Chats from "../components/Chats";
import Spaces from "../components/Spaces";
import Business from "../components/Business";
import Saved from "../components/Saved";
import SettingsPage from "../components/Settings";
import Notifications from "../components/Notifications";

import LeftSidebar from "../components/layout/LeftSidebar";

function PremiumHeader({
  onNavigate,
}) {
  return (
    <header className="premium-global-header">
      <div className="premium-global-header-inner">
        <button
          type="button"
          className="premium-global-logo"
          onClick={() =>
            onNavigate(
              "home"
            )
          }
        >
          <span>Я</span>

          <strong>
            ТУТ
          </strong>
        </button>

        <button
          type="button"
          className="premium-global-search"
          onClick={() =>
            onNavigate(
              "search"
            )
          }
        >
          <Search
            size={19}
          />

          <span>
            Пошук у ЯТУТ
          </span>
        </button>

        <div className="premium-global-actions">
          <button
            type="button"
            className="premium-header-create"
            onClick={() =>
              onNavigate(
                "create"
              )
            }
          >
            <Plus
              size={17}
            />

            Створити
          </button>

          <button
            type="button"
            className="premium-header-icon-button"
            onClick={() =>
              onNavigate(
                "chats"
              )
            }
          >
            <MessageCircle
              size={21}
            />

            <b>3</b>
          </button>

          <button
            type="button"
            className="premium-header-icon-button"
            onClick={() =>
              onNavigate(
                "notifications"
              )
            }
          >
            <Bell
              size={21}
            />

            <b>5</b>
          </button>

          <button
            type="button"
            className="premium-header-icon-button"
            onClick={() =>
              onNavigate(
                "saved"
              )
            }
          >
            <Bookmark
              size={21}
            />
          </button>

          <button
            type="button"
            className="premium-header-icon-button"
          >
            <Moon
              size={21}
            />
          </button>

          <button
            type="button"
            className="premium-header-profile"
            onClick={() =>
              onNavigate(
                "profile"
              )
            }
          >
            <span className="premium-header-profile-avatar">
              В
              <i />
            </span>

            <div>
              <strong>
                Вадим
              </strong>

              <small>
                Я тут · Київ
              </small>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default function PremiumHomePreview() {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(
    "home"
  );

  const [
    chatPersonId,
    setChatPersonId,
  ] = useState(null);

  const [
    selectedCityId,
    setSelectedCityId,
  ] = useState(
    "kyiv"
  );

  const [
    selectedVideoId,
    setSelectedVideoId,
  ] = useState(null);

  const [
    selectedLiveVideoId,
    setSelectedLiveVideoId,
  ] = useState(null);

  const [
    selectedCreatorId,
    setSelectedCreatorId,
  ] = useState(
    "maria"
  );

  const [
    selectedCreateType,
    setSelectedCreateType,
  ] = useState(
    "video"
  );

  function goToPage(
    page,
    payload = null
  ) {
    if (!page) {
      return;
    }

    if (
      page ===
      "chats"
    ) {
      if (
        typeof payload ===
        "string"
      ) {
        setChatPersonId(
          payload
        );
      } else {
        setChatPersonId(
          payload?.personId ||
          null
        );
      }
    }

    if (
      page ===
        "cityPulse" &&
      payload?.cityId
    ) {
      setSelectedCityId(
        payload.cityId
      );
    }

    if (
      page ===
        "clips" ||
      page ===
        "watch"
    ) {
      setSelectedVideoId(
        payload?.videoId ||
        null
      );
    }

    if (
      page ===
      "live"
    ) {
      setSelectedLiveVideoId(
        payload?.videoId ||
        null
      );
    }

    if (
      page ===
        "creator" &&
      payload?.creatorId
    ) {
      setSelectedCreatorId(
        payload.creatorId
      );
    }

    if (
      page ===
        "createMedia" &&
      payload?.type
    ) {
      setSelectedCreateType(
        payload.type
      );
    }

    setCurrentPage(
      page
    );

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }

  function openPersonChat(
    personId
  ) {
    if (!personId) {
      return;
    }

    setChatPersonId(
      personId
    );

    setCurrentPage(
      "chats"
    );

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }

  function renderPage() {
    switch (
      currentPage
    ) {
      case "home":
        return (
          <HomePage
            renderLeftNavigation={
              <LeftSidebar
                embedded
                activePage="home"
                onNavigate={
                  goToPage
                }
              />
            }
          />
        );

      case "now":
        return (
          <NowPage
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "pulse":
        return (
          <PulsePage
            onNavigate={
              goToPage
            }
          />
        );

      case "clips":
        return (
          <ClipsPage
            key={
              selectedVideoId ||
              "clips"
            }
            initialVideoId={
              selectedVideoId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "watch":
        return (
          <WatchPage
            key={
              selectedVideoId ||
              "watch"
            }
            initialVideoId={
              selectedVideoId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "live":
        return (
          <LivePage
            key={
              selectedLiveVideoId ||
              "live"
            }
            initialVideoId={
              selectedLiveVideoId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "cityPulse":
        return (
          <CityPulsePage
            cityId={
              selectedCityId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "creator":
        return (
          <CreatorProfilePage
            creatorId={
              selectedCreatorId
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "creatorStudio":
        return (
          <CreatorStudioPage
            onNavigate={
              goToPage
            }
          />
        );

      case "create":
        return (
          <CreateHubPage
            onNavigate={
              goToPage
            }
          />
        );

      case "createMedia":
        return (
          <CreateMediaPage
            type={
              selectedCreateType
            }
            onNavigate={
              goToPage
            }
          />
        );

      case "profile":
        return (
          <ProfilePage
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "friends":
        return (
          <Friends
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "search":
        return (
          <SearchPage
            onNavigate={
              goToPage
            }
            onOpenChat={
              openPersonChat
            }
          />
        );

      case "chats":
        return (
          <Chats
            initialPersonId={
              chatPersonId
            }
          />
        );

      case "communities":
        return (
          <Spaces
            onNavigate={
              goToPage
            }
          />
        );

      case "events":
        return (
          <EventsPulsePage
            onNavigate={
              goToPage
            }
          />
        );

      case "nearby":
        return (
          <NearbyPulsePage
            onNavigate={
              goToPage
            }
          />
        );

      case "business":
        return (
          <Business
            onNavigate={
              goToPage
            }
          />
        );

      case "saved":
        return (
          <Saved
            onNavigate={
              goToPage
            }
          />
        );

      case "settings":
        return (
          <SettingsPage
            onNavigate={
              goToPage
            }
          />
        );

      case "notifications":
        return (
          <Notifications
            onNavigate={
              goToPage
            }
          />
        );

      default:
        return (
          <HomePage
            renderLeftNavigation={
              <LeftSidebar
                embedded
                activePage="home"
                onNavigate={
                  goToPage
                }
              />
            }
          />
        );
    }
  }

  const isHome =
    currentPage ===
    "home";

  const hideSidebar =
    isHome ||
    currentPage ===
      "clips";

  const sidebarActivePage =
    [
      "cityPulse",
      "clips",
      "watch",
      "live",
      "creator",
      "creatorStudio",
    ].includes(
      currentPage
    )
      ? "pulse"
      : currentPage;

  const hideMobileCreate =
    [
      "clips",
      "watch",
      "live",
      "create",
      "createMedia",
      "creatorStudio",
    ].includes(
      currentPage
    );

  return (
    <div
      className={`premium-app-shell premium-app-shell-${currentPage}`}
    >
      <PremiumHeader
        onNavigate={
          goToPage
        }
      />

      <div
        className={`premium-desktop-layout ${
          isHome
            ? "premium-desktop-layout-home"
            : ""
        }`}
      >
        {!hideSidebar && (
          <LeftSidebar
            activePage={
              sidebarActivePage
            }
            onNavigate={
              goToPage
            }
          />
        )}

        <main
          className={`premium-page-content premium-page-${currentPage}`}
        >
          {renderPage()}
        </main>
      </div>

      {!hideMobileCreate && (
        <button
          type="button"
          className="yatut-global-mobile-create"
          onClick={() =>
            goToPage(
              "create"
            )
          }
        >
          <Plus
            size={25}
          />
        </button>
      )}
    </div>
  );
}