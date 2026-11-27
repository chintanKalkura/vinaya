// Owner-approved wording (25 Nov 2026; marking and the habit's page 26 Nov 2026): docs/style-choices/how-to-use/walkthrough-and-help.md

export interface WalkthroughCard {
  key: string;
  title: string;
  body: string;
}

// The icons are chosen by key in WalkthroughScreen
export const WALKTHROUGH_CARDS: WalkthroughCard[] = [
  {
    key: 'habits',
    title: 'Build habits your way',
    body: 'Give a habit a name and choose how often it repeats: every day, or a number of days each week, month or year. A habit is either a Checkmark you tick off or Hours you log.',
  },
  {
    key: 'mark',
    title: 'Mark it done',
    body: 'Tap the circle to mark a habit done today. For an Hours habit, tap its bar to log the hours you spent.',
  },
  {
    key: 'streaks',
    title: 'Keep your streak going',
    body: "Each day you complete a habit adds to its streak. Streaks earn freezes, and you choose how many streak days earn one. A freeze covers a missed day so the streak isn't lost.",
  },
  {
    key: 'groups',
    title: 'Group related habits',
    body: 'Put habits in a group and choose what completes it: all of them, any one, the required ones, or a total of hours.',
  },
  {
    key: 'backup',
    title: 'Keep your progress safe',
    body: 'Sign in with Google in Profile to back up your habits to the cloud and bring them to a new phone.',
  },
];

export interface HelpTopic {
  key: string;
  title: string;
  body: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    key: 'create',
    title: 'Creating a habit',
    body: 'Tap + and choose New Habit. Give it a name, a cadence (Day, Week, Month or Year) and, for Week, Month or Year, how many days in that period it should be done. Choose Checkmark to mark it done, or Hours to log time against a daily target. You can add it to a group here, or create a new group for it.',
  },
  {
    key: 'mark',
    title: 'Marking done and logging hours',
    body: "Tap a habit's circle to mark it done today, and tap again to undo. For an Hours habit, tap its progress bar, set today's hours and tap Done. To fix a day you missed, open the habit, tap ⋮ and choose Edit past days.",
  },
  {
    key: 'streaks',
    title: 'Streaks and streak freezes',
    body: 'The number beside a habit is its streak. "1 skip per N streaks" means every N days of streak earns one freeze. When you miss a day, a freeze is used automatically and the streak carries on; the habit turns icy blue that day and shows how many freezes are left.',
  },
  {
    key: 'groups',
    title: 'Groups and their types',
    body: "A group completes when its habits meet its rule. Required: the habits you mark as required are done. Any: any one habit is done. All: every habit is done. Hours: the hours logged across its habits reach the group's target. A habit can be in several groups.",
  },
  {
    key: 'cadence',
    title: 'Week, Month and Year cadence',
    body: "These use rolling windows that end today: the last 7 days, the last month's worth of days, or the last year. A Week habit with a target of 3 is complete while it has been done on 3 of the last 7 days.",
  },
  {
    key: 'views',
    title: 'Views, sort and filter',
    body: 'Switch between list view and group view with the icons at the top. The cadence filter shows only Day, Week, Month or Year items. Sort and filter orders by streak, name or most recent, and can show only what is completed.',
  },
  {
    key: 'page',
    title: "A habit's page",
    body: 'Tap a habit or a group to open its page, with its rating, streaks, completion rate and history.',
  },
  {
    key: 'edit',
    title: 'Editing and deleting',
    body: "Tap ⋮ on a habit or a group to edit or delete it. A habit's type can't be changed. Deleting a habit removes it from its groups; deleting a group keeps its habits.",
  },
  {
    key: 'backup',
    title: 'Backup and sign-in',
    body: 'Signing in is optional. Signed in with Google, Vinaya backs up your habits once a week to a hidden folder in your own Google Drive, and you can tap Back up now in Profile at any time. Sign in on a new phone to bring them back. Without signing in, your habits stay only on this phone.',
  },
];

export const SHOW_WALKTHROUGH_AGAIN = 'Show the walkthrough again';
export const EMPTY_HABITS_TEXT =
  'No habits yet. Tap + to create your first one.';
