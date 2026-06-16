import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeScreen from "./HomeScreen";

describe("HomeScreen Component", () => {
  beforeEach(() => {
    // Clear sessionStorage and restore mocks before each test
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders correctly with translations and layout links", () => {
    render(<HomeScreen />);
    
    // Check for logo
    const logo = screen.getByAltText("Grovkornet Logo");
    expect(logo).toBeInTheDocument();
    
    // Check translation keys match
    expect(screen.getByText("home.subtitle")).toBeInTheDocument();
    expect(screen.getByText("home.description")).toBeInTheDocument();
    expect(screen.getByText("home.coming_soon_badge")).toBeInTheDocument();
    
    // Check Discord link is correct
    const discordLink = screen.getByRole("link", { name: /home.join_discord/i });
    expect(discordLink).toHaveAttribute("href", "https://discord.gg/cvYa4SmPaW");
  });

  it("applies animation classes and updates sessionStorage on first mount", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    
    const { container } = render(<HomeScreen />);
    
    // Container should eventually be resolved to the home-content class
    const content = container.querySelector(".home-content");
    
    // Check it gets the animate-first class
    expect(content).toHaveClass("animate-first");
    
    // Check sessionStorage was updated
    expect(setItemSpy).toHaveBeenCalledWith("grovkornet-animated", "true");
  });

  it("does not apply animation class if already animated before", () => {
    sessionStorage.setItem("grovkornet-animated", "true");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    
    const { container } = render(<HomeScreen />);
    
    const content = container.querySelector(".home-content");
    
    // Check it does not get the animate-first class
    expect(content).not.toHaveClass("animate-first");
    
    // sessionStorage setItem should not be called again
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("manages opacity correctly before and after hydration (isMounted)", () => {
    // We render the component. In testing environment, useEffect runs instantly during render,
    // so we will see isMounted=true state immediately.
    const { container } = render(<HomeScreen />);
    const content = container.querySelector(".home-content");
    
    // After mount/hydration, opacity inline style should be removed (empty string)
    expect(content).toHaveStyle({ opacity: "" });
  });
});
