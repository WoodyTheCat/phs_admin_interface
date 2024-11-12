import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const DevTools: React.FC = () => {
  return (
    <>
      <ReactQueryDevtools position="left" />
      <TanStackRouterDevtools />
    </>
  );
};

export default DevTools;
