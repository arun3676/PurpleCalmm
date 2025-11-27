import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/NewHome";
import Calm from "./pages/Calm";
import Sleep from "./pages/NewSleep";
import Migraine from "./pages/Migraine";
import LocalJournal from "./pages/LocalJournal";
import JournalTrends from "./pages/JournalTrends";
import MyJourneys from "./pages/MyJourneys";
import LocalCatChat from "./pages/LocalCatChat";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/calm"} component={Calm} />
      <Route path={"/sleep"} component={Sleep} />
      <Route path={"/migraine"} component={Migraine} />
      <Route path={"/journal"} component={LocalJournal} />
      <Route path={"/journal-trends"} component={JournalTrends} />
      <Route path={"/my-journeys"} component={MyJourneys} />
      <Route path={"/chat"} component={LocalCatChat} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
