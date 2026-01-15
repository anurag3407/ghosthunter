"use client";

import React from "react";
import { motion } from "motion/react";
import { Folder, HeartHandshakeIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseWithRestApiProps {
    className?: string;
    circleText?: string;
    badgeTexts?: {
        first: string;
        second: string;
        third: string;
        fourth: string;
    };
    buttonTexts?: {
        first: string;
        second: string;
    };
    title?: string;
    lightColor?: string;
}

const DatabaseWithRestApi = ({
    className,
    circleText,
    badgeTexts,
    buttonTexts,
    title,
    lightColor,
}: DatabaseWithRestApiProps) => {
    return (
        <div
            className={cn(
                "relative flex h-[350px] w-full max-w-[500px] flex-col items-center",
                className
            )}
        >
            {/* SVG Paths  */}
            <svg
                className="h-full sm:w-full text-muted"
                width="100%"
                height="100%"
                viewBox="0 0 200 100"
            >
                <g
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="0.4"
                    strokeDasharray="100 100"
                    pathLength="100"
                >
                    <path d="M 31 10 v 25 q 0 5 5 5 h 59 q 5 0 5 5 v 15" />
                    <path d="M 77 10 v 20 q 0 5 5 5 h 13 q 5 0 5 5 v 15" />
                    <path d="M 124 10 v 20 q 0 5 -5 5 h -14 q -5 0 -5 5 v 15" />
                    <path d="M 170 10 v 25 q 0 5 -5 5 h -60 q -5 0 -5 5 v 15" />
                    {/* Animation For Path Starting */}
                    <animate
                        attributeName="stroke-dashoffset"
                        from="100"
                        to="0"
                        dur="1s"
                        fill="freeze"
                        calcMode="spline"
                        keySplines="0.25,0.1,0.5,1"
                        keyTimes="0; 1"
                    />
                </g>
                {/* Blue Lights */}
                <g mask="url(#db-mask-1)">
                    <circle
                        className="database db-light-1"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                <g mask="url(#db-mask-2)">
                    <circle
                        className="database db-light-2"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                <g mask="url(#db-mask-3)">
                    <circle
                        className="database db-light-3"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                <g mask="url(#db-mask-4)">
                    <circle
                        className="database db-light-4"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-blue-grad)"
                    />
                </g>
                {/* Icon Badges */}
                <g stroke="currentColor" fill="none" strokeWidth="0.4">
                    {/* Google Icon */}
                    <g transform="translate(16, -5)">
                        <circle fill="#18181B" cx="15" cy="15" r="15" stroke="currentColor" strokeWidth="0.4" />
                        <g transform="translate(3, 3) scale(1)">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </g>
                    </g>
                    {/* GitHub Icon */}
                    <g transform="translate(62, -5)">
                        <circle fill="#18181B" cx="15" cy="15" r="15" stroke="currentColor" strokeWidth="0.4" />
                        <g transform="translate(3, 3) scale(1)">
                            <path fill="white" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </g>
                    </g>
                    {/* MetaMask Icon */}
                    <g transform="translate(109, -5)">
                        <circle fill="#18181B" cx="15" cy="15" r="15" stroke="currentColor" strokeWidth="0.4" />
                        <g transform="translate(1, 1) scale(0.85)">
                            <path fill="#E2761B" d="M32.958 1l-13.134 9.718 2.442-5.727L32.958 1z" />
                            <path fill="#E4761B" d="M2.663 1l13.017 9.809-2.325-5.818L2.663 1zM28.23 23.533l-3.495 5.339 7.483 2.06 2.143-7.282-6.131-.117zM.622 23.65l2.127 7.282 7.466-2.06-3.478-5.339-6.115.117z" />
                            <path fill="#E4761B" d="M9.856 14.578l-2.084 3.143 7.433.334-.25-7.983-5.1 4.506zM25.764 14.578l-5.175-4.598-.167 8.075 7.417-.334-2.075-3.143zM10.215 28.872l4.464-2.176-3.857-3.009-.607 5.185zM20.942 26.696l4.447 2.176-.59-5.185-3.857 3.009z" />
                            <path fill="#F6851B" d="M25.389 28.872l-4.447-2.176.357 2.903-.042 1.227 4.132-1.954zM10.215 28.872l4.148 1.954-.025-1.227.341-2.903-4.464 2.176z" />
                        </g>
                    </g>
                    {/* Meta (Facebook) Icon */}
                    <g transform="translate(155, -5)">
                        <circle fill="#18181B" cx="15" cy="15" r="15" stroke="currentColor" strokeWidth="0.4" />
                        <g transform="translate(3, 3) scale(1)">
                            <path fill="#0866FF" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                        </g>
                    </g>
                </g>
                <defs>
                    {/* 1 - Google */}
                    <mask id="db-mask-1">
                        <path
                            d="M 31 10 v 25 q 0 5 5 5 h 59 q 5 0 5 5 v 15"
                            strokeWidth="0.6"
                            stroke="white"
                        />
                    </mask>
                    {/* 2 - GitHub */}
                    <mask id="db-mask-2">
                        <path
                            d="M 77 10 v 20 q 0 5 5 5 h 13 q 5 0 5 5 v 15"
                            strokeWidth="0.6"
                            stroke="white"
                        />
                    </mask>
                    {/* 3 - MetaMask */}
                    <mask id="db-mask-3">
                        <path
                            d="M 124 10 v 20 q 0 5 -5 5 h -14 q -5 0 -5 5 v 15"
                            strokeWidth="0.6"
                            stroke="white"
                        />
                    </mask>
                    {/* 4 - Meta */}
                    <mask id="db-mask-4">
                        <path
                            d="M 170 10 v 25 q 0 5 -5 5 h -60 q -5 0 -5 5 v 15"
                            strokeWidth="0.6"
                            stroke="white"
                        />
                    </mask>
                    {/* Blue Grad */}
                    <radialGradient id="db-blue-grad" fx="1">
                        <stop offset="0%" stopColor={lightColor || "#00A6F5"} />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
            </svg>
            {/* Main Box */}
            <div className="absolute -bottom-2 flex w-full flex-col items-center">
                {/* bottom shadow */}
                <div className="absolute -bottom-4 h-[100px] w-[62%] rounded-lg bg-accent/30" />
                {/* box title */}
                <div className="absolute -top-3 z-20 flex items-center justify-center rounded-lg border bg-[#101112] px-2 py-1 sm:-top-4 sm:py-1.5">
                    <SparklesIcon className="size-3" />
                    <span className="ml-2 text-[10px]">
                        {title ? title : "Data exchange using a customized REST API"}
                    </span>
                </div>
                {/* box outter circle */}
                <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border-t bg-[#141516] font-semibold text-xs">
                    {circleText ? circleText : "API"}
                </div>
                {/* box content */}
                <div className="relative z-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background shadow-md">
                    {/* Badges */}
                    <div className="absolute bottom-8 left-12 z-10 h-7 rounded-full bg-[#101112] px-3 text-xs border flex items-center gap-2 ">
                        <HeartHandshakeIcon className="size-4" />
                        <span>{buttonTexts?.first || "GhostHunter"}</span>
                    </div>
                    <div className="absolute right-16 z-10 hidden h-7 rounded-full bg-[#101112] px-3 text-xs sm:flex border items-center gap-2">
                        <Folder className="size-4" />
                        <span>{buttonTexts?.second || "v2_updates"}</span>
                    </div>
                    {/* Circles */}
                    <motion.div
                        className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border-t bg-accent/5"
                        animate={{
                            scale: [0.98, 1.02, 0.98, 1, 1, 1, 1, 1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border-t bg-accent/5"
                        animate={{
                            scale: [1, 1, 1, 0.98, 1.02, 0.98, 1, 1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border-t bg-accent/5"
                        animate={{
                            scale: [1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-[120px] h-[235px] w-[235px] rounded-full border-t bg-accent/5"
                        animate={{
                            scale: [1, 1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DatabaseWithRestApi;

const DatabaseIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
    return (
        <svg
            x={x}
            y={y}
            xmlns="http://www.w3.org/2000/svg"
            width="5"
            height="5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
    );
};
