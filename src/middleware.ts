import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/discover/:path*", "/wardrobe/:path*", "/glow-up/:path*", "/outfits/:path*", "/swipe/:path*", "/face-outfit/:path*", "/shop/:path*", "/fashion-school/:path*", "/weather-outfits/:path*", "/size-guide/:path*"],
};
