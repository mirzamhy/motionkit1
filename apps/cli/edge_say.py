"""Free TTS via edge-tts with word timings, so no STT pass is needed.
usage: python edge_say.py <voice> <rate e.g. +10%> <text file> <out.mp3> <out.json>
writes out.json = [[word, start_s, end_s], ...]"""
import asyncio
import json
import sys

import edge_tts


async def main(voice: str, rate: str, text_file: str, out_mp3: str, out_json: str) -> None:
    text = open(text_file, encoding='utf-8').read().strip()
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary='WordBoundary')
    words = []
    with open(out_mp3, 'wb') as f:
        async for chunk in comm.stream():
            if chunk['type'] == 'audio':
                f.write(chunk['data'])
            elif chunk['type'] == 'WordBoundary':
                start = chunk['offset'] / 1e7  # 100 ns ticks
                words.append([chunk['text'], round(start, 3), round(start + chunk['duration'] / 1e7, 3)])
    json.dump(words, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    asyncio.run(main(*sys.argv[1:6]))
