import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

const SettingsPage: React.FC = () => {
  return <>Settings</>;
};

export default SettingsPage;

export const Route = createLazyFileRoute("/settings")({
  component: SettingsPage,
});
