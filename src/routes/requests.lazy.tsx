import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

const RequestsPage: React.FC = () => {
  return <>Requests</>;
};

export default RequestsPage;

export const Route = createLazyFileRoute("/requests")({
  component: RequestsPage,
});
