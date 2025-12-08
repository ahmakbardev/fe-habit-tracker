"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { MapContainerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// CUSTOM MARKER
const CustomIcon = L.icon({
  iconUrl: "/assets/images/marker/marker.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Apply custom icon globally
L.Marker.prototype.options.icon = CustomIcon;

export default function LeafletWrapper(props: MapContainerProps) {
  return <MapContainer {...props}>{props.children}</MapContainer>;
}

export { TileLayer, Marker, Popup };
