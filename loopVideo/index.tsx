/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addContextMenuPatch, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import { Menu } from "@webpack/common";
import definePlugin from "@utils/types";

let lastRightClickedVideo: HTMLVideoElement | null = null;

function findVideoNear(el: HTMLElement): HTMLVideoElement | null {
    if (el.tagName === "VIDEO") return el as HTMLVideoElement;

    let current: HTMLElement | null = el;
    for (let i = 0; i < 15 && current; i++) {
        if (current.tagName === "VIDEO") return current as HTMLVideoElement;
        const child = current.querySelector("video");
        if (child) return child as HTMLVideoElement;
        current = current.parentElement;
    }

    return null;
}

function onMouseDown(e: MouseEvent) {
    if (e.button !== 2) return;
    lastRightClickedVideo = findVideoNear(e.target as HTMLElement);
}

// Loop/Repeat SVG icon matching Discord's menu icon style
function LoopIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
    );
}

// Active/glowing style applied to the icon when loop is ON
const activeIconStyle: React.CSSProperties = {
    color: "var(--brand-500, #5865f2)",
    filter: "drop-shadow(0 0 4px var(--brand-500, #5865f2))",
};

function LoopIconActive() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={activeIconStyle}
        >
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
    );
}

const videoLoopPatch: NavContextMenuPatchCallback = (children) => {
    const video = lastRightClickedVideo;
    if (!video) return;

    const isLooping = video.loop;

    children.push(
        <Menu.MenuSeparator />,
        <Menu.MenuItem
            id="vc-loop-video"
            label={isLooping ? "Disable Loop" : "Loop Video"}
            icon={isLooping ? LoopIconActive : LoopIcon}
            action={() => {
                video.loop = !video.loop;
            }}
        />
    );
};

export default definePlugin({
    name: "LoopVideo",
    description: "Adds a 'Loop Video' button when right-clicking a video in chat",
    authors: [
        {
            name: "You",
            id: 0n,
        },
    ],

    start() {
        document.addEventListener("mousedown", onMouseDown, true);
        addContextMenuPatch("message", videoLoopPatch);
        addContextMenuPatch("native-link", videoLoopPatch);
    },

    stop() {
        document.removeEventListener("mousedown", onMouseDown, true);
        removeContextMenuPatch("message", videoLoopPatch);
        removeContextMenuPatch("native-link", videoLoopPatch);
        lastRightClickedVideo = null;
    },
});
