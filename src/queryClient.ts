import { QueryClient } from '@tanstack/react-query';

// Shared React Query client singleton.
//
// Lives in its own module (rather than index.tsx) so consumers like
// AuthContext can import the client without pulling in index.tsx's
// `ReactDOM.createRoot` side-effect — that bootstrap requires a `#root`
// DOM node and throws under jsdom, breaking any test that renders a tree
// importing AuthContext.
export const queryClient = new QueryClient();
