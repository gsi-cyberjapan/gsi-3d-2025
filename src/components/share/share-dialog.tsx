"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/store/useStore";
import { GENERAL_CONFIG } from "@/lib/config";
import { QrCode, Copy, Check, Code, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const ShareDialog = () => {
  const isShareDialogOpen = useStore((state) => state.isShareDialogOpen);
  const setIsShareDialogOpen = useStore((state) => state.setIsShareDialogOpen);

  const [showQr, setShowQr] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (!isShareDialogOpen) return "";
    return typeof window !== "undefined" ? window.location.href : "";
  }, [isShareDialogOpen]);

  const title = GENERAL_CONFIG.TITLE;

  const embedCode = useMemo(() => {
    if (!shareUrl) return "";
    return `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`;
  }, [shareUrl]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsShareDialogOpen(open);
      if (!open) {
        setShowQr(false);
        setShowEmbed(false);
        setUrlCopied(false);
        setEmbedCopied(false);
      }
    },
    [setIsShareDialogOpen],
  );

  const handleCopyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => {
      setUrlCopied(false);
    }, 2000);
  }, [shareUrl]);

  const handleCopyEmbed = useCallback(async () => {
    await navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => {
      setEmbedCopied(false);
    }, 2000);
  }, [embedCode]);

  const handleShareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareUrl]);

  const handleShareX = useCallback(() => {
    const url = `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareUrl, title]);

  const handleShareEmail = useCallback(() => {
    const url = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`;
    window.location.href = url;
  }, [shareUrl, title]);

  return (
    <Dialog open={isShareDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle>共有</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={handleShareFacebook}
            >
              <FacebookIcon className="size-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={handleShareX}
            >
              <XIcon className="size-4" />X (Twitter)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                setShowQr((prev) => !prev);
                setShowEmbed(false);
              }}
            >
              <QrCode className="size-4" />
              QR コード
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                void handleCopyUrl();
              }}
            >
              {urlCopied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {urlCopied ? "コピー済み" : "URL コピー"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => {
                setShowEmbed((prev) => !prev);
                setShowQr(false);
              }}
            >
              <Code className="size-4" />
              サイト埋め込み
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={handleShareEmail}
            >
              <Mail className="size-4" />
              メール送信
            </Button>
          </div>

          {showQr && (
            <div className="flex justify-center p-4 bg-white rounded-md border">
              <QRCodeSVG value={shareUrl} size={200} />
            </div>
          )}

          {showEmbed && (
            <div className="flex flex-col gap-2">
              <textarea
                readOnly
                value={embedCode}
                className="w-full h-20 text-xs p-2 rounded-md border bg-muted font-mono resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void handleCopyEmbed();
                }}
              >
                {embedCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {embedCopied ? "コピー済み" : "埋め込みコードをコピー"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
