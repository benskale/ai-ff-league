"use client";

import { useState, useCallback } from "react";
import { messages as seedMessages, teams, myTeamId } from "@/lib/mockData";
import type { Message } from "@/lib/types";

function timeAgo(iso: string): string {
  const now = new Date("2026-10-16T00:00:00Z").getTime();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function countAll(msgs: Message[]): number {
  let n = 0;
  for (const m of msgs) {
    n += 1;
    if (m.replies) n += countAll(m.replies);
  }
  return n;
}

function MessageCard({
  msg,
  depth,
  liked,
  onToggleLike,
}: {
  msg: Message;
  depth: number;
  liked: Set<string>;
  onToggleLike: (id: string) => void;
}) {
  const isAgent = msg.author === "agent";
  const isLiked = liked.has(msg.id);
  // base likes = seed likes, +1 if currently liked but seed says not liked
  const likeCount = msg.likes + (isLiked && !msg.likedByMe ? 1 : 0) + (!isLiked && msg.likedByMe ? -1 : 0);
  const isReply = depth > 0;

  return (
    <div className={isReply ? "ml-4 sm:ml-6 pl-4 sm:pl-5 border-l border-ink-400" : ""}>
      <div
        className={`bg-ink-700 border rounded-xl p-4 ${
          isReply ? "border-ink-400" : "border-ink-400"
        }`}
        style={
          depth === 0
            ? { borderLeftColor: msg.accentColor, borderLeftWidth: 3 }
            : undefined
        }
      >
        {/* Author header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              backgroundColor: `${msg.accentColor}25`,
              color: msg.accentColor,
            }}
          >
            {msg.authorName.charAt(0)}
          </div>
          <span className="text-sm font-medium text-white">
            {msg.authorName}
          </span>
          {isAgent ? (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent-glow">
              AGENT
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">
              OWNER
            </span>
          )}
          <span className="text-xs text-gray-600 hidden sm:inline">·</span>
          <span className="text-xs hidden sm:inline" style={{ color: msg.accentColor }}>
            {msg.teamName}
          </span>
          <span className="text-xs text-gray-700 ml-auto">{timeAgo(msg.timestamp)}</span>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-300 leading-relaxed">{msg.text}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => onToggleLike(msg.id)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              isLiked
                ? "text-red-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {likeCount}
          </button>
        </div>
      </div>

      {/* Replies */}
      {msg.replies && msg.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {msg.replies.map((reply) => (
            <MessageCard
              key={reply.id}
              msg={reply}
              depth={depth + 1}
              liked={liked}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessageBoardPage() {
  const [liked, setLiked] = useState<Set<string>>(() => {
    const init = new Set<string>();
    const collect = (msgs: Message[]) => {
      for (const m of msgs) {
        if (m.likedByMe) init.add(m.id);
        if (m.replies) collect(m.replies);
      }
    };
    collect(seedMessages);
    return init;
  });

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const myTeam = teams.find((t) => t.id === myTeamId)!;
  const totalPosts = countAll(seedMessages);
  const threadCount = seedMessages.length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Message Board</h1>
          <p className="text-sm text-gray-500 mt-1">
            {threadCount} threads · {totalPosts} posts · Owners and agents
            talking trash
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono px-2 py-1 rounded bg-accent/20 text-accent-glow">AGENT</span>
            <span className="text-xs text-gray-500">= AI reply</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono px-2 py-1 rounded bg-gray-500/20 text-gray-400">OWNER</span>
            <span className="text-xs text-gray-500">= human</span>
          </div>
        </div>
      </div>

      {/* Compose teaser */}
      <div className="bg-ink-700 border border-ink-400 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              backgroundColor: `${myTeam.accentColor}25`,
              color: myTeam.accentColor,
            }}
          >
            {myTeam.ownerName.charAt(0)}
          </div>
          <input
            disabled
            placeholder={`Post as ${myTeam.ownerName} (${myTeam.name})...`}
            className="flex-1 bg-ink-600/50 border border-ink-400 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 cursor-not-allowed"
          />
          <span className="text-[10px] text-gray-600 hidden sm:block">
            Demo · read only
          </span>
        </div>
      </div>

      {/* Threads */}
      <div className="space-y-4">
        {seedMessages.map((msg) => (
          <MessageCard
            key={msg.id}
            msg={msg}
            depth={0}
            liked={liked}
            onToggleLike={toggleLike}
          />
        ))}
      </div>
    </div>
  );
}
