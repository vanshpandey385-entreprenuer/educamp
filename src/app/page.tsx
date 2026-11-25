import { AppRouter } from "@/routes/AppRouter";
import { AppStoreProvider } from "@/store/AppStore";

/** The whole app lives on this one page; the sidebar switches between screens. */
export default function HomePage() {
  return (
    <AppStoreProvider>
      <AppRouter />
    </AppStoreProvider>
  );
}
