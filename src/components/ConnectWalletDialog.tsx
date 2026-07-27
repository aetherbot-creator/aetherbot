import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";
import { PhantomConnectDialog } from "@/components/PhantomConnectDialog";
import type { WalletConnectResponse } from "@/lib/api";

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected?: (response: WalletConnectResponse) => void;
}

export const ConnectWalletDialog = ({ open, onOpenChange, onWalletConnected }: ConnectWalletDialogProps) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showPhantomDialog, setShowPhantomDialog] = useState(false);

  const wallets = [
    {
      name: "Phantom",
      icon:
       "data:image/png;base64,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",
    },
    {
      name: "Solflare",
      icon: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAsgMBEQACEQEDEQH/xAAbAAEAAQUBAAAAAAAAAAAAAAAABAIDBQYHAf/EAD0QAAEDAwEGAgYHBgcAAAAAAAEAAgMEBREGEiExQVFhE3EycpGhwdEUIiMzQoGxB0NSU2LhFRaCkqKy0v/EABsBAQACAwEBAAAAAAAAAAAAAAADBgIEBQEH/8QANREAAgEDAgQCCQMDBQAAAAAAAAECAwQRBTESIUFRE2EiIzJxgaGx0fAUQpEVM/EGUmLB4f/aAAwDAQACEQMRAD8A7igCAIAgCAIAgCAIAgNd1LNXx1MQpjKItnIMY4uzwPuXA1epdxqR8LPD5dzqWEKEovjxnz7GZofGdSQuqW4l2RtDuuxbOo6MXVXpY5nPqqKqNQ2JKnIwgCAIAgCAIAgCAIAgCAIAgCAIAgCAIAgCAw16vX+HVDIWQiR7m7Ry7GBnHwXJ1DU/0s1BRy99zetbLx4uTeDI0NWyspY54wQHjgeS6FvXjXpKpHqatam6U3B9CQpiMIAgCAIAgPMoCDBeKCevdQxVDXVDc5aO3HeoI3FKVTw0+ZsSta0aXiyjyJ6nNcIAgCAIAgCAIAgCAIAgCA0rVL9q7PGfRY0fFVHWHm7fuRYdOXqF72ZnScm3ag3P3cjm/H4rr6NLNrjs3+fM52pxxXz3RnF1znhAEAQBAeE4QGlan1OXbdHbXjZxiSZp9zfmuLeahl+HSfvZ39P0vHra69yJWjrE6lAuFY0idw+zYfwA8z3Uun2jgvEnv0/PMh1S/VR+DTfJb+bNsXVOMEAQBAEAQBAEAQBAEAQHhQGhahftXio7ED3Kmam+K7mWawji3iZfRUmY6qPPBzXY8xj4BdXQ5ehOPnk0NWjiUJGzrvHICAIAgKZHNYwuc4NaN5JOMLxvCyEm3hGh6l1K6sLqWgeW0/B0nAyeXZcG8v8AxMwp+z37ll0/TFS9ZV5y7divSOn/ABnMuFaz7IHMMZ/F/Ue3RZ2FnxYqT26GGqX/AAZo03z6vt5G9YC7hXT1AEAQBAEAQBAEAQBAEAQHhQHObs/budU4fzXfJUi7fFcTa7lstVihBeRlNFy4uMzP448+w/3XS0WWK0o91k0tWj6qMuzNzVlOAEAQFqeaKGF8krwxjRlzjwCxnKMVmWxlGLm+GK5nPtSahfciYKUujox7ZPPt2VevL2VduMOUfqWew09W/pz5y+h7pewm6TfSKlpFHGcb/wB47p5dfYsrKz8Z8UvZXzPdRv8A9PHgh7T+R0RoDWgAYA4AKw7FVzk9QBAEAQBAEAQBAEBRLI2JhfIQGtGSTyWM5xhFylsj1JyeFuRqS5UlYXCnlDnN4jBB9617e8oXGfDlnBLVt6lL20TFtEIQHjjgLxg5hVSeJUTSDg6Rzh+ZVGqNSnKS2bf1LlTjiEV5InaZnFPe6cuOGyZZ7eHvW7ptRQuYt9eRq6hTc7eWOnM6CDlW0q56gLFZVw0cD56h4ZGwbyVhUqRpxcpPCJKVKdWShBZZzq/32e6ybLcx0jTlkefS7lVu7u53DxtHt9y02NhC3WXzl3+xasFnlu9UWjaZTswZX9B0HdLS1dxLyW5ne3kbWnneT2OmU0EdPCyGFgZGwYa0cAFZYxUFwxXIqM5ynJyk8tl1ZGIQBAEAQBAEAQBAEBYrYG1NNJA8kNe0gkcVFXpKtTdOWzM6c3TmproaJVwVFsqy1xLJGb2vZuyOoVJrUqtpVxnDWzXUslOcK9PO6fQ2G0aiZMBDWkRycBJ+F3yKsNjq0amIVuT79Gcy606UPSpc127Gd8VhZth7S3HHO5dhSTWUzmcLTw0a/qC/xRwvpqOQSTOBDnN4MHn1XIv9ShGLp0nlvr2OpY2E5SVSosJfM00g43KubciwlJyN4JBHAjksl5HuE0bVadWsbG2K5tcHAYErBkHzC79tqseHFb+Th3OkycuKj/BkKnVtrhjLo5HzO5MYwjP5nAW1PU7eKynn88zVhpVzJ4ax+eRpt6vFRdp9uU7MTfQiB3N7+a41xczuJZlt2LDZ2dO2hhc31ZGtVunulY2mg3Di954NHUryhQlWnwokubmFvT45f5Om22hgt9Kymp24Y0cebj1Ks1GlGlBQj0KfXrzrzdSe5MUpCEAQBAEAQBAEAQBAEAwgMdebZHcacsI2ZG72P6H5LSvrSNzDHVbM2bW5lQnlbdTQZWlj3MkbsvaSHA8iqa4OLcZLbkWiDTimtineRjJwvctLBlyRW2NRuRi5IGPsikFItPjWakZqRHkZhTxZLFlk7lKiRFBydzd5O4DqVkl2PeS5s6fp+1x2qgjiDWmZwBleB6TvkrRa0FRpqPXr7ymXt1K4quT26LsjKrZNQIAgCAIAgCAIAgCAIAgCA8ygOd34tN5rNjh4nvwM+/Kpt/j9VUa2LVZZ/TwyR42rnyZPJkljNygciFs9fGvFI8UiPI1TRZNFkWQLYiyaLIkgWxFk8S3FIIpY3kZDHh2PI5U0eTUux7KHFFrujsEMrJomSRnaY9oc0jgQVbYtSWUUOUXGTi90XF6YhAEAQBAEAQBAEAQBAeZQHheBx3ea8bC5mHvF+p6OJzYXtlnIw1rDkDuSufd6hTorEXmT/OZv2tjOtLMlhGil5fI57zlxJJJ5lVSTb5vqWVRUYpLYkRKCRHIlxuAC15IhaPXuBXkUeJEaUqeKJYkSQ71sRJ4kSXmtmJPEiPO9bEUTI2HTmqX2pjaarjdNTD0S0/WZ5dQt+1vHSXBJZRyL/SlcPxIcpG1RawssnGqLPXYQulG+oPrg40tIu1tHPxRLj1FaJT9S403+qQD9VKrik9pEErC6jvTf8EuGvpJvuamCT1JAVIpxezIJUasfai18C/tLIjAdk8EALsckB6DkIDC1l/ZTVhg8Iua04c/PA+S4txrMKNfwuHKW7N+lYyqU+PJOuNwit8All2nAnADRvK37q7ha0+OZrUKEq0uGJhpdVHeIaQnu9/yC5M9ee0Kf8v7HQjpf+6RCm1PXu9AQs8m5+K1Za1cy2SX55mzDTKK3yyDPebjL6VU8Do3ctaWoXU95/wAG1Cyt47RIE00kx+2lfJ67iVrylKftPJsxpwj7KSLJwOCJLYkXMoY7eVnJcjJokRvUEkRSRfa9ROJE4npkXigFEsyPUsUSJEaRyniiWKIspU8UTRRFkK2IomiiglZGRQTjgsjLBQTu3rJGSRbLWyHGyHHpjK9UU9ke5aJ1Fbrw/AoKOvaCcAxsfGPbuC2I06v7UzWrXVqv7s45+D+50PQ9Ld6WinbeDLveDEyaTbc0c8nJ7LpWsKkYvjKpq9W1qVE7fHm0sIwesYNQyahBoRWGEhv0cwbWw089rG4b88eSguVW8T0fgdLS52KtH4uM9c7/AA+HY6BBt+BH4pBk2RteeN66CzgrEuHifDsQ5rTRzVIqJIsyc9+4+YWlU0+3q1fFlHmTwuqsIcCfIv1lHDWxeFUM2m5z0IKnuLencQ4KiyiOlVnSlmDwYx+maF3omdnqvz+oXOlolq9sr4/c3I6nXW+GR5NJwn7uqlHrtB/TCilodP8AbN/IljqtTrFEaTSM37urYfWYR8VHLRH+2fyJo6tFbxI0mlLg30JIH/mR8FE9GrLZomjqtF7pmGrqGqoHhlXC6MngTwd5FaFW3q0HiosHQo16dZZg8kDOHkd0xyNrHIuseonEwcS6JFg4mDiDInCMFDpFkomSiWJHqWMSRIjSPU8USpEZ7t6niiaJsFg0rVXeIVEsn0emd6Li3Ln+Q6d1uULOVVZbwjk3urU7Z8EVxS+hssGhLVH96+qnP9cgaP8AiAt6NhSW+Wcieu3UvZSXwz9WZKn0zZqc5jt0JI5vG0fep421KOyNSep3c96j+hk4KaCAfYwRx+owBSqKWyNSVSc/abZeWRgMBAMIAgCAIAgCAIAgIlyooq+lfTzDIcNx5tPIhQ16Ea0HCRLQrSozU4nK6uN0Mr2u9Njix3mDhVNRxJwfQu1KSnFNdS22RHEzcS4JFhwGPCPETgHCUukWSieqJZfIpIxJFEsPfxUyiSRRXbKf6dcqamccNlla0+RO9TU4qU4x7kdzU8KlKa6JnZ4o2xMayNoaxowAOQViSxyR8/k3J5e7Li9PAgCAIAgCAIAgCAIAgCAICiV7Y2Oe8gNaMknkF42kssJOTwjlFdMKisqJgPqyyvePzJKp85cVSUl1bfzLzRhwU4x7JL5EB+WndwWceZsLmeeIsuE94R4m5ecI4SkyLJRMlEtOf3WaiZKJRvJ7LPGDPYvUtQ6kqoaiMZdE8PA4ZwcrKD4ZKS6EVWn4sJQfVHZLfXQ3CkiqaZ21FI0EHp2PdWGE1OKlEoFajOjUdOa5olLIiCAIAgCAIAgCAIAgCAIDxxwgNI1ZfvpD3UFG/wCyBxK8fiPQdlwdQvPEfhU9upYdMsOBeNU36Gq73ENYMuJwGgZJK5cVl4R221FZexm6bSV1qGB72xQA8BK/63sAK6ENOryWXhHOqatbQlhZfu/9MddtPXC2tMlREDF/NidtNHnzHsXlS2rUVmS5G3balQrvEXz7Mw5Y7qFEmjoKRTsO6he5Pcoy+n9N1N6ftsPh0zTh0zhxPQDmtq3oTreSOffalTteT5y7fc2v/IdB4Wz9JqfEx6WW49mFvf0+n3ZxP69cZzwrBq+odL1lnBmafHpR+9aN7fWHxWnWtZUue6OzY6pSuvR2l2+xTpLUT7LV7E73GhlP128dg/xD4rO2r+HLD2MtT05XdPih7a+fl9jq0MjZWNkY4OY4ZaQdxC7CaayikuLi8PcuIeBAEAQBAEAQBAEAQHhO5Aapqy/eA11BRvxMR9rI0+gOnmuTqF7wp0qb59X2Ozplh4mK1Rcui7+Zpccck0rIoWF8jjgMA4lcSEXJpJblhlKMIuUnyRvum9OR20Nqalokq3D8o+w+asFnZKl6c+cvoVi/1GVd8EOUfqbGuicwolYJGFjmhzXAggjIK8aTXMJtPKOUakoGWu7zU0QxHuewdAeSr1zRVKq4ovGn3Dr28ZvfZmJ3kgDieChN47HaKSOht9PTRNw2OMD8+Z9qslKChBRR8/uKsq1WVSXUmqQhKXsDwWuALSMEHmgTaeUaHqjROdursjADxfTZwD6nTy4foufXtP3U/wCCyafreMU7n4P7/ct/s9u1S2sks1Q1zmMY5zQ4HMWDvBHIJZ1ZcTpsy1y0puCuY7vl7zoLV0CsnqAIAgCAIAgCAIAgNf1PfBbYfApyDVyDd/QOp+C599d+DHhj7T+XmdLT7F15cc/ZXz8jQ4IZ66qEMAdLNIc9STzJPxVfhCdSfCucizTlClDilySOg6fsEVqjEjtmSrcMPkxw7N7Kx2lnGgs7y7lWvb+dy8LlHsZscFumgEAQHO/2kRbF2pZgPvINn/aT/wCguRqEfWxfdFq0GWaMo9n9f8Gq0zduqgZx2pWt9pC0YLMkdqo8Qk/JnbG8eysp87KkAQHh3hAUNia1xcGtDnekQN5TCPW21hsrCHh6gCAIAgCAIAgCAxV/vMdppdo4dO/dGzr3PZal3dRt4Z6vZG5ZWkrmeOi3Zz6ngrLzXlrMyzyEue88AOpVdhTqXFTlzbLROdK1pZfJI6DYrNT2qDZYNuZw+vLjefLoFY7W1hQjy36sq13eTuZ5e3RfnUyg3BbRqHqAIAgNK/aZDmlopxxZI5ntH9gudqEeUZFg/wBPz9ZOHdfT/Jpljb4l7tzORqY/ZtBaFGPrIrzRYLyXDbVH/wAX9Ds4GFYD5+eoAgCAIAgCAIAgCAIAgCApcSMoDlV0q5q+tlnqXbT9pzRjgADgAKp1qkqtRykXS3pRo0lGB0OwUFPQ0EQp2YMjQ57jvLj3VktaMKVNcJVLy4qVqz43sZRbBrBAEAQBAat+0RoNgLjxEzMLTvv7R2NDb/V48jR9JgO1NbAf5x/6krn2y9bH87lk1PlZVX5f9pHYV3ChhAEAQBAEAQBAEAQBAf/Z",
    },
    {
      name: "MetaMask",
      icon: "data:image/png;base64,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",
    },
    {
      name: "Trust Wallet",
      icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
    },
  ];

  const handleWalletConnect = (walletName: string) => {
    setSelectedWallet(walletName);
    onOpenChange(false);
    setShowPhantomDialog(true);
  };

  const handleBackToWallets = () => {
    setShowPhantomDialog(false);
    setSelectedWallet(null);
    onOpenChange(true);
  };

  const handleWalletConnected = (response: WalletConnectResponse) => {
    if (onWalletConnected) {
      onWalletConnected(response);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Connect Wallet</DialogTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Wallet Grid */}
            <div className="grid grid-cols-2 gap-3">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet.name)}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors border border-border"
                >
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-12 h-12 rounded-lg"
                  />
                  <span className="text-sm font-medium">{wallet.name}</span>
                </button>
              ))}
            </div>

            {/* Other Wallet Section */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Other Wallet</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter wallet name"
                  className="bg-muted border-border"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PhantomConnectDialog
        open={showPhantomDialog}
        onOpenChange={setShowPhantomDialog}
        walletName={selectedWallet || ""}
        onBack={handleBackToWallets}
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};
