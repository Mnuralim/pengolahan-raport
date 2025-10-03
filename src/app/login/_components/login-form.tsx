"use client";

import React, { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { ErrorMessage } from "../../_components/error-message";
import { login } from "@/actions/auth";
import Image from "next/image";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, pending] = useActionState(login, {
    error: null,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <Image src={"/logo1.png"} width={80} height={80} alt={"logo"} />
            <h1 className="text-lg font-semibold text-slate-800">
              TK Negeri Wakeakea
            </h1>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="mb-8">
          <div className="py-3 px-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
            <p className="text-xs font-medium text-blue-600 text-center">
              Selamat datang di sistem
            </p>
            <p className="text-sm text-slate-800 mt-1 font-medium text-center">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>
        </div>

        {state.error && <ErrorMessage message={state.error} />}

        <form action={action}>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                className="w-full px-4 py-3 rounded-lg 
                  border border-slate-200
                  bg-white text-slate-800
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                  hover:border-slate-300
                  transition-colors duration-200
                  placeholder:text-slate-400"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-lg 
                    border border-slate-200
                    bg-white text-slate-800
                    focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent
                    hover:border-slate-300
                    transition-colors duration-200
                    placeholder:text-slate-400"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                    p-1 rounded-md
                    text-slate-400 hover:text-slate-600 hover:bg-slate-100
                    transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-3 
        bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600
        text-white font-medium py-3 px-4
        rounded-lg border border-blue-600
        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        transition-colors duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
