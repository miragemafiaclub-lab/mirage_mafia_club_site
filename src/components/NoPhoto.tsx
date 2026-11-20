import lion from "../assets/lion-mark.png";

/** Stand-in for a player without a photo: the club's lion, tinted by CSS (.no-photo in index.css). Decorative. */
export default function NoPhoto() {
  return <span className="no-photo" aria-hidden="true" style={{ ["--lion" as string]: `url(${lion})` }} />;
}
