import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { Puck } from "@/components/puck/core";
import "@measured/puck/puck.css";
import { conf, initialData } from "@/components/puck/config";

const DynamicPagesPage: React.FC = () => {
  return (
    <Puck
      config={conf}
      data={initialData}
      onPublish={save}
      dnd={{ disableAutoScroll: true }}
    />
  );
};

export const Route = createLazyFileRoute("/dynamic-pages")({
  component: DynamicPagesPage,
});

// Save the data to your database
const save = (data: any) => {};
