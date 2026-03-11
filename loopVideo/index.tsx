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

const videoLoopPatch: NavContextMenuPatchCallback = (children) => {
    const video = lastRightClickedVideo;
    if (!video) return;

    children.push(
        <Menu.MenuSeparator />,
        <Menu.MenuCheckboxItem
            id="vc-loop-video"
            label="Loop Video"
            checked={video.loop}
            action={() => {
                video.loop = !video.loop;
            }}
        />
    );
};

export default definePlugin({
    name: "LoopVideo",
    description: "Adds a 'Loop Video' checkbox when right-clicking a video in chat",
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
