"use client";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React from "react";

export default function SignUpForm() {
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto text-center">
        <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg
            className="h-8 w-8 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Account Registration
        </h1>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          New accounts are created by the system administrator.
          Please contact your administrator to request access.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
