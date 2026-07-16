import { Component, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Player from '@/pages/player';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ShieldAlert } from 'lucide-react';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md p-8 glass-card">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto" strokeWidth={1.5} />
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Что-то пошло не так</h1>
            <p className="text-sm text-muted-foreground">Попробуйте обновить страницу.</p>
            <button onClick={() => window.location.reload()} className="glass-button bg-primary text-primary-foreground py-2 px-6 w-full hover:bg-primary/90">
              Обновить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/player/:tag" component={Player} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-primary-foreground" translate="no">
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12">
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </main>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
