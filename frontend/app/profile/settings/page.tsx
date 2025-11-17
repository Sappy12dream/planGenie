'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Bell, Moon, Trash2, LogOut } from 'lucide-react';
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

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Local state for preferences (in a real app, these would be saved to a database)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSavePreferences = () => {
    // In a real app, you'd save these to your backend
    toast.success('Preferences saved successfully');
  };

  const handleDeleteAccount = async () => {
    // In a real app, you'd call an API to delete the account
    toast.error('Account deletion is not yet implemented');
    // await deleteAccount();
    // signOut();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
        {/* Header */}
        <div className="border-b bg-white/50 backdrop-blur-sm">
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
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600">Manage your account preferences</p>
          </div>

          {/* Account Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600">Email Address</Label>
                <p className="mt-1 text-slate-900">{user?.email}</p>
              </div>
              <div>
                <Label className="text-slate-600">Account Created</Label>
                <p className="mt-1 text-slate-900">
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
                <Label className="text-slate-600">User ID</Label>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {user?.id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
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
                  <p className="text-sm text-slate-500">
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
                  <p className="text-sm text-slate-500">
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
                  <p className="text-sm text-slate-500">
                    Receive a weekly summary of your progress
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                />
              </div>

              <Button onClick={handleSavePreferences} className="mt-4">
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-slate-500">
                    Enable dark theme (coming soon)
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={(checked) => {
                    setDarkMode(checked);
                    toast.info('Dark mode coming soon!');
                  }}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-900">Danger Zone</CardTitle>
              <CardDescription className="text-red-700">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logout */}
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4">
                <div>
                  <h3 className="font-medium text-slate-900">Logout</h3>
                  <p className="text-sm text-slate-600">
                    Sign out of your account
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-4">
                <div>
                  <h3 className="font-medium text-slate-900">Delete Account</h3>
                  <p className="text-sm text-slate-600">
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
