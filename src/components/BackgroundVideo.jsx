import { useEffect, useRef } from "react";

const BackgroundVideo = () => {
   const videoRef = useRef(null);
   let playAttemptTimeout = null;

   useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      let isMounted = true;

      const attemptPlay = () => {
         video.play().catch((error) => {
            if (!isMounted) return;
            console.warn("Lecture échouée, nouvelle tentative...", error);
            playAttemptTimeout = setTimeout(attemptPlay, 500);
         });
      };

      video.loop = true;
      video.muted = true;
      video.playsInline = true;

      attemptPlay();

      const handleVisibilityChange = () => {
         if (document.visibilityState === "visible" && isMounted) {
            attemptPlay();
         }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
         isMounted = false;
         if (playAttemptTimeout) {
            clearTimeout(playAttemptTimeout);
         }
         document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
         );
         if (video) {
            video.pause();
            video.removeAttribute("src");
            video.load();
         }
      };
   }, []);

   return (
      <div className="fixed inset-0 z-0">
         <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            preload="auto"
         >
            <source src="/video/video1.mp4" type="video/mp4" />
         </video>
         {/* Couche d'ombre floue */}
         <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      </div>
   );
};

export default BackgroundVideo;
