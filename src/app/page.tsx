"use client";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

function page() {
  useEffect(() => {
    redirect("/dashboard");
  }, []);
  return <div>page</div>;
}

export default page;
