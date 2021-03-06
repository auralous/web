import { SvgMove } from "assets/svg";
import clsx from "clsx";
import { Button } from "components/Pressable";
import { useI18n } from "i18n/index";
import { useEffect, useState } from "react";
import { verifyScript } from "utils/script-utils";
import usePlayer from "./usePlayer";
/// <reference path="youtube" />

const YT_PLAYER_VARS = {
  playsinline: 1,
  controls: 0,
  disablekb: 1,
  fs: 1,
  origin: process.env.APP_URI,
};

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: null | (() => void);
  }
}

export default function YouTubePlayer() {
  const { t } = useI18n();
  const [{ player, playerPlaying }] = usePlayer();

  useEffect(() => {
    let ytPlayer: YT.Player;
    let durationInterval: number; // setInterval

    function playByExternalId(externalId: string | null) {
      if (!externalId) return ytPlayer.pauseVideo();
      ytPlayer.loadVideoById(externalId);
      player.play();
    }

    async function init(hadLoaded: boolean) {
      if (!hadLoaded) {
        // wait for iframe api to load
        await new Promise<void>((resolve) => {
          window.onYouTubeIframeAPIReady = resolve;
        });
      }
      if (!(ytPlayer instanceof window.YT.Player)) {
        ytPlayer = new window.YT.Player("ytPlayer", {
          playerVars: YT_PLAYER_VARS,
          events: {
            onReady() {
              player.registerPlayer({
                play: () => ytPlayer.playVideo(),
                seek: (ms) => {
                  ytPlayer.seekTo(ms / 1000, true);
                  player.emit("seeked");
                },
                pause: () => ytPlayer.pauseVideo(),
                playByExternalId,
                setVolume: (p) => ytPlayer.setVolume(p * 100),
                isPlaying: () =>
                  ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING,
              });
              durationInterval = window.setInterval(() => {
                player.emit("time", ytPlayer.getCurrentTime() * 1000);
              }, 1000);
            },
            onStateChange(event) {
              event.data === window.YT.PlayerState.PAUSED
                ? player.emit("paused")
                : player.emit("playing");
              // ENDED
              if (event.data === window.YT.PlayerState.ENDED)
                player.emit("ended");
            },
          },
        });
      }
    }

    verifyScript("https://www.youtube.com/iframe_api").then(init);

    return function cleanup() {
      window.clearInterval(durationInterval);
      window.onYouTubeIframeAPIReady = null;
      player.unregisterPlayer();
      ytPlayer?.destroy();
    };
  }, [player]);

  const [posIsTop, setPosIsTop] = useState(false);

  return (
    <div
      className={clsx(
        "fixed z-20 w-56 h-36 rounded-lg shadow-xl overflow-hidden",
        posIsTop ? "top-2 right-2" : "bottom-2 right-2",
        !playerPlaying && "hidden"
      )}
    >
      <Button
        size="xs"
        icon={<SvgMove className="w-4 h-4" />}
        accessibilityLabel={`${t("player.youtube.moveTo.title")} ${
          posIsTop
            ? t("player.youtube.moveTo.bottomRight")
            : t("player.youtube.moveTo.topRight")
        }`}
        onPress={() => setPosIsTop(!posIsTop)}
        style={{
          position: "absolute",
          zIndex: 30,
          bottom: ".5rem",
          left: ".5rem",
        }}
        styling="outline"
      />
      <div
        className="bottom-0 left-0 absolute w-full h-full overflow-hidden"
        id="ytPlayer"
      />
    </div>
  );
}
