/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** HeidiSQL Executable Path - Path to heidisql.exe. Leave empty to auto-detect from Program Files. */
  "heidisqlPath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-connections` command */
  export type SearchConnections = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-connections` command */
  export type SearchConnections = {}
}

