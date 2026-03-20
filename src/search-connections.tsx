import {
  Action,
  ActionPanel,
  closeMainWindow,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { readAllSessions } from "./lib/registry";
import {
  decryptPassword,
  findHeidisqlExe,
  NET_TYPE_LABELS,
  openSession,
} from "./lib/heidisql";
import type { HeidiSession } from "./lib/types";

function SessionListItem({
  session,
  exePath,
}: {
  session: HeidiSession;
  exePath: string;
}) {
  const dbType = NET_TYPE_LABELS[session.netType] ?? "Unknown";
  const hostPort = session.host ? `${session.host}:${session.port}` : undefined;

  return (
    <List.Item
      title={session.name}
      subtitle={dbType}
      keywords={[session.folder ?? "", session.host, session.user, dbType]}
      accessories={[
        hostPort ? { text: hostPort } : {},
        session.user ? { text: session.user, icon: Icon.Person } : {},
      ].filter((a) => a.text)}
      actions={
        <ActionPanel>
          <Action
            title="Open in Heidisql"
            icon={Icon.ArrowRight}
            onAction={async () => {
              openSession(session, exePath);
              await closeMainWindow();
            }}
          />
          {session.password && (
            <Action.CopyToClipboard
              title="Copy Password"
              content={decryptPassword(session.password)}
              shortcut={{ modifiers: ["cmd"], key: "p" }}
            />
          )}
          {session.host && (
            <Action.CopyToClipboard
              title="Copy Host"
              content={session.host}
              shortcut={{ modifiers: ["cmd"], key: "h" }}
            />
          )}
          <Action.CopyToClipboard
            title="Copy Session Name"
            content={session.name}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
          />
        </ActionPanel>
      }
    />
  );
}

export default function SearchConnections() {
  const exePath = findHeidisqlExe();
  const {
    data: sessions,
    isLoading,
    error,
  } = usePromise(async () => readAllSessions());

  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to load sessions",
      message: String(error),
    });
  }

  if (!exePath) {
    showToast({
      style: Toast.Style.Failure,
      title: "HeidiSQL not found",
      message: "Set the path in extension preferences",
    });
  }

  const folders = [
    ...new Set((sessions ?? []).filter((s) => s.folder).map((s) => s.folder!)),
  ];
  const topLevel = (sessions ?? []).filter((s) => !s.folder);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search connections...">
      {topLevel.length > 0 && (
        <List.Section title="Connections">
          {topLevel.map((session) => (
            <SessionListItem
              key={session.registryPath}
              session={session}
              exePath={exePath ?? ""}
            />
          ))}
        </List.Section>
      )}
      {folders.map((folder) => (
        <List.Section title={folder} key={folder}>
          {(sessions ?? [])
            .filter((s) => s.folder === folder)
            .map((session) => (
              <SessionListItem
                key={session.registryPath}
                session={session}
                exePath={exePath ?? ""}
              />
            ))}
        </List.Section>
      ))}
    </List>
  );
}
