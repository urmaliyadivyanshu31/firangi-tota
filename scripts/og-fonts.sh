#!/bin/sh
# Rebuilds the share-card fonts in server/og/fonts/ (the /api/og image renderer reads TTF; the
# game's own files are WOFF2). Run it with a folder holding the unmodified TTFs from
# https://github.com/google/fonts (ofl/tirodevanagarihindi, ofl/kalam, ofl/oldstandardtt,
# apache/specialelite). It keeps the Latin and Devanagari ranges the game's CSS uses, every
# OpenType layout feature (Devanagari needs its conjuncts and matra positioning) and the name
# table, and drops hinting. Needs fonttools (pip install fonttools).
set -eu
SRC="${1:?usage: scripts/og-fonts.sh <folder with the google/fonts TTFs>}"
OUT="$(dirname "$0")/../server/og/fonts"
LATIN='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
DEVA='U+0900-097F,U+1CD0-1CF4,U+1CF7-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF'

subset() {
  pyftsubset "$SRC/$1" --unicodes="$2" --layout-features='*' --no-hinting --name-IDs='*' --output-file="$OUT/$3"
}

mkdir -p "$OUT"
subset TiroDevanagariHindi-Regular.ttf "$LATIN,$DEVA" tiro-devanagari-hindi-400.ttf
subset Kalam-Regular.ttf "$LATIN,$DEVA" kalam-400.ttf
subset OldStandard-Regular.ttf "$LATIN" old-standard-tt-400.ttf
subset OldStandard-Bold.ttf "$LATIN" old-standard-tt-700.ttf
subset SpecialElite-Regular.ttf "$LATIN" special-elite-400.ttf
