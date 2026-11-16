#!/usr/bin/env bash
# Copyright (C) 2026 Veridom (Khrystyna Didukh)
# SPDX-License-Identifier: Apache-2.0
#
# Joins the recorded parts into the demo video.
#   build-video.sh <parts-dir> <devnet-recording.webm> <out-dir>
# Output: veridom-milestones-demo-1080p.mp4 and a copy under 10 MB.
set -euo pipefail
parts=$1; devnet=$2; out=$3
mkdir -p "$out"
enc=(-r 30 -c:v libx264 -preset medium -pix_fmt yuv420p -an)

# Browser parts: drop the blank lead-in before the first frame is painted.
ffmpeg -y -loglevel error -ss 0.6 -i "$parts/a-app.webm" -vf "scale=1920:1080" "${enc[@]}" -crf 20 "$parts/a.mp4"
ffmpeg -y -loglevel error -ss 0.6 -i "$parts/c-close.webm" -vf "scale=1920:1080" "${enc[@]}" -crf 20 "$parts/c.mp4"

# Devnet part: the whole proven run, sped up to about 24 seconds.
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$devnet")
factor=$(python3 -c "print(max(1.0, ($dur - ${DEVNET_SKIP:-0}) / 24))")
ffmpeg -y -loglevel error -ss "${DEVNET_SKIP:-0}" -i "$devnet" -vf "setpts=PTS/$factor,scale=1920:1080,tpad=stop_mode=clone:stop_duration=3" "${enc[@]}" -crf 20 "$parts/b.mp4"

printf "file '%s'\n" "$parts/a.mp4" "$parts/b.mp4" "$parts/c.mp4" > "$parts/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$parts/list.txt" -c copy -movflags +faststart "$out/veridom-milestones-demo-1080p.mp4"

# Small copy: same picture at a bitrate that lands under 10 MB.
total=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/veridom-milestones-demo-1080p.mp4")
kbps=$(python3 -c "print(int(9.2 * 8192 / $total))")
ffmpeg -y -loglevel error -i "$out/veridom-milestones-demo-1080p.mp4" -vf "scale=1280:720" -c:v libx264 -preset slow -b:v "${kbps}k" -maxrate "${kbps}k" -bufsize "$((kbps * 2))k" -pix_fmt yuv420p -an -movflags +faststart "$out/veridom-milestones-demo.mp4"
ls -la "$out"
