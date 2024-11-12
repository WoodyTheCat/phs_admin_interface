import { createFileRoute } from "@tanstack/react-router";
import React from "react";

const LoginPage: React.FC = () => {
  return <>Posts</>;
};

export default LoginPage;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
