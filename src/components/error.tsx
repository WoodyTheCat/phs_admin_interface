import React from "react";

const ErrorComponent: React.FC<{ error: Error }> = ({ error }) => {
  return <>Error: {error.message}</>;
};

export default ErrorComponent;
