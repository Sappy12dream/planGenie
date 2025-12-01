'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bell, Moon, Sun, Trash2, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getUserPreferences, updateUserPreferences } from '@/lib/api/preferences';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;

      try {
        const prefs = await getUserPreferences();
        setEmailNotifications(prefs.email_notifications);
        setTaskReminders(prefs.task_reminders);
        setWeeklyDigest(prefs.weekly_digest);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences({
        email_notifications: emailNotifications,
        task_reminders: taskReminders,
        weekly_digest: weeklyDigest,
      });
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion is not yet implemented');
  };

  const isDarkMode = theme === 'dark';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="border-b bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your account preferences
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600 dark:text-slate-400">
                  Email Address
                </Label>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {user?.email}
                </p>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400">
                  Account Created
                </Label>
                <p className="mt-1 text-slate-900 dark:text-slate-100">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    : 'Recently'}
                </p>
              </div>
              <div>
                <Label className="text-slate-600 dark:text-slate-400">
                  User ID
                </Label>
                <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {user?.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive email updates about your plans
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-reminders">Task Reminders</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get reminders for upcoming task deadlines
                  </p>
                </div>
                <Switch
                  id="task-reminders"
                  checked={taskReminders}
                  onCheckedChange={setTaskReminders}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive a weekly summary of your progress
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                />
              </div>

              <Button
                onClick={handleSavePreferences}
                className="mt-4"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                Appearance
              </CardTitle>
              <CardDescription>Customize your interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {theme === 'system'
                      ? 'Following system preferences'
                      : isDarkMode
                        ? 'Dark theme enabled'
                        : 'Light theme enabled'}
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? 'dark' : 'light');
                    toast.success(
                      `Switched to ${checked ? 'dark' : 'light'} mode`
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-500">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4 dark:border-red-900/50 dark:bg-slate-900">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    Logout
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sign out of your account
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4 dark:border-red-900/50 dark:bg-slate-900">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    Delete Account
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers, including all plans, tasks, and chat history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
