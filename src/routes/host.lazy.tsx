// import { Button } from "@/components/ui/button";
// import * as Dropdown from "@/components/ui/dropdown-menu";
import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

const HostPage: React.FC = () => {
  return (
    <></>
    // <Dropdown.Menu>
    //   <Dropdown.MenuTrigger asChild>
    //     <Button variant="outline">Open</Button>
    //   </Dropdown.MenuTrigger>
    //   <Dropdown.MenuContent className="w-56">
    //     <Dropdown.MenuLabel>Appearance</Dropdown.MenuLabel>
    //     <Dropdown.MenuSeparator />
    //     <Dropdown.MenuCheckboxItem
    //       checked={showStatusBar}
    //       onCheckedChange={setShowStatusBar}
    //     >
    //       Status Bar
    //     </Dropdown.MenuCheckboxItem>
    //     <Dropdown.MenuCheckboxItem
    //       checked={showActivityBar}
    //       onCheckedChange={setShowActivityBar}
    //       disabled
    //     >
    //       Activity Bar
    //     </Dropdown.MenuCheckboxItem>
    //     <Dropdown.MenuCheckboxItem
    //       checked={showPanel}
    //       onCheckedChange={setShowPanel}
    //     >
    //       Panel
    //     </Dropdown.MenuCheckboxItem>
    //   </Dropdown.MenuContent>
    // </Dropdown.Menu>
  );
};

export const Route = createLazyFileRoute("/host")({
  component: HostPage,
});
