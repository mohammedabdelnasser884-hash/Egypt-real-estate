import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Layout from '@/components/layout/layout';
import DashboardLayout from '@/components/layout/dashboard-layout';

// Public Pages
import Home from '@/pages/home';
import Search from '@/pages/search';
import ListingDetail from '@/pages/listing-detail';
import OfficeProfile from '@/pages/office-profile';
import Requests from '@/pages/requests';
import Compare from '@/pages/compare';
import Areas from '@/pages/areas';

// Dashboard Pages
import DashboardHome from '@/pages/dashboard/home';
import DashboardListings from '@/pages/dashboard/listings';
import DashboardOffice from '@/pages/dashboard/office';
import DashboardRequests from '@/pages/dashboard/requests';
import DashboardSavedSearches from '@/pages/dashboard/saved-searches';
import DashboardNotifications from '@/pages/dashboard/notifications';
import DashboardProfile from '@/pages/dashboard/profile';
import DashboardReports from '@/pages/dashboard/reports';

const queryClient = new QueryClient();

function PublicRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/listing/:id" component={ListingDetail} />
        <Route path="/office/:id" component={OfficeProfile} />
        <Route path="/requests" component={Requests} />
        <Route path="/compare" component={Compare} />
        <Route path="/areas" component={Areas} />
        <Route path="/dashboard/*">
          <DashboardRouter />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function DashboardRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={DashboardHome} />
        <Route path="/dashboard/listings" component={DashboardListings} />
        <Route path="/dashboard/office" component={DashboardOffice} />
        <Route path="/dashboard/requests" component={DashboardRequests} />
        <Route path="/dashboard/saved-searches" component={DashboardSavedSearches} />
        <Route path="/dashboard/notifications" component={DashboardNotifications} />
        <Route path="/dashboard/profile" component={DashboardProfile} />
        <Route path="/dashboard/reports" component={DashboardReports} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Switch>
            <Route path="/dashboard/*">
              <DashboardRouter />
            </Route>
            <Route path="/dashboard">
              <DashboardRouter />
            </Route>
            <Route path="*">
              <PublicRouter />
            </Route>
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
