import React, { useState } from "react";
import { Role, roleSchema, User } from "../types/user";
import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

import * as Api from "@/api";
import * as Lucide from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import * as Tabs from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import * as Dropdown from "@/components/ui/dropdown-menu";
import * as Dialog from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { z as Zod } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import * as Select from "@/components/ui/select";
import { Department } from "@/types/misc";
import { cn } from "@/lib/utils";

const UsersPage: React.FC = () => {
  const userQuery = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: Api.Users.getUsers,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <Tabs.Root
      defaultValue="users"
      className="flex flex-col gap-4 p-4 md:gap-4 md:p-8 h-screen"
    >
      <div className="flex items-center">
        <Tabs.List>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="permissions">Permissions</Tabs.Trigger>
        </Tabs.List>
        <Button
          size="sm"
          variant="secondary"
          disabled={userQuery.isRefetching}
          onClick={async () => await userQuery.refetch()}
        >
          <Lucide.RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
        <Button size="sm" className="h-8 gap-1">
          <Lucide.UserPlus className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            New user
          </span>
        </Button>
      </div>

      <Tabs.Content
        value="users"
        className="flex flex-col shrink max-h-screen overflow-y-scroll overflow-x-clip"
      >
        <UsersTab userQuery={userQuery} />
      </Tabs.Content>
      <Tabs.Content value="permissions">
        <PermissionsTab />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default UsersPage;

const UsersTab: React.FC<{
  userQuery: UseInfiniteQueryResult<
    InfiniteData<
      {
        nextCursor: number | null;
        previousCursor: number;
        data: User[];
      },
      unknown
    >,
    Error
  >;
}> = ({ userQuery }) => {
  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: Api.Departments.getDepartments,
  });

  // TODO: Proper error states and loaders here
  return userQuery.isPending || departmentsQuery.isPending ? (
    <span>Loading...</span>
  ) : userQuery.isError || departmentsQuery.isError ? (
    <>
      <span>
        Error: {userQuery.error?.message}
        {departmentsQuery.error?.message}
      </span>
    </>
  ) : (
    <Table className="flex-auto overflow-y-scroll">
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead className="w-[150px]">Department</TableHead>
          <TableHead className="w-[150px]">Role</TableHead>
          <TableHead className="w-[200px]">Last Login</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userQuery.data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                departments={departmentsQuery.data}
              />
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

const UserRow: React.FC<{
  user: User;
  departments: Department[];
}> = ({ user, departments }) => {
  const [editOpen, setEditOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: Api.Users.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const putUserMutation = useMutation({
    mutationFn: Api.Users.putUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-muted-foreground">{user.username}</div>
      </TableCell>
      <TableCell className="text-ellipsis text-nowrap overflow-hidden max-w-[150px]">
        {departments.find((d) => d.id === user.department)?.department}
      </TableCell>
      <TableCell className="capitalize">{user.role}</TableCell>
      <TableCell>2023-06-23</TableCell>
      <TableCell>
        <Dropdown.Menu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
          <Dropdown.MenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Lucide.MoreHorizontal className="h-4 w-4" />
            </Button>
          </Dropdown.MenuTrigger>
          <Dropdown.MenuContent align="end">
            <Dropdown.MenuLabel>{user.username}</Dropdown.MenuLabel>
            <Dropdown.MenuSeparator />
            <Dialog.DropdownItemConfirm
              triggerChildren="Log out"
              title={<>Log out {user.username}?</>}
              description="This will log out this user from all of their sessions."
              onConfirm={() => Api.Auth.logoutUser(user.id)}
              onOpenChange={(open: boolean) => !open && setMenuOpen(false)}
            />
            <ChangePasswordDialog
              user={user}
              onOpenChange={(open: boolean) => !open && setMenuOpen(false)}
            />
            <Dropdown.MenuItem onSelect={() => setEditOpen(true)}>
              Edit user
            </Dropdown.MenuItem>
            <Dropdown.MenuSeparator />
            <Dialog.DropdownItemConfirm
              className="text-red-600"
              triggerChildren="Delete user"
              title={<>Confirm deletion of {user.username}</>}
              description="This action cannot be undone. This will permanently delete the account and its associated data from the server."
              onConfirm={() => deleteUserMutation.mutateAsync(user.id)}
              onOpenChange={(open: boolean) => !open && setMenuOpen(false)}
            />
          </Dropdown.MenuContent>
        </Dropdown.Menu>

        <EditUserSheet
          initialUser={user}
          open={editOpen}
          setOpen={setEditOpen}
          mutation={putUserMutation}
          departments={departments}
        />
      </TableCell>
    </TableRow>
  );
};

const changePasswordDialogSchema = Zod.object({
  newPassword: Zod.string().min(8, "Password must contain 8 characters"),
  confirmNewPassword: Zod.string().min(8, "Password must contain 8 characters"),
}).refine((values) => values.newPassword === values.confirmNewPassword, {
  message: "Passwords must match!",
  path: ["confirmNewPassword"],
});

const ChangePasswordDialog = React.forwardRef<
  any,
  {
    onSelect?: () => void;
    onOpenChange: (open: boolean) => void;
    user: User;
  }
>(({ onSelect, onOpenChange, user }, forwardedRef) => {
  const form = useForm<Zod.infer<typeof changePasswordDialogSchema>>({
    resolver: zodResolver(changePasswordDialogSchema),
    defaultValues: {
      confirmNewPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = (values: Zod.infer<typeof changePasswordDialogSchema>) => {
    values.newPassword === values.confirmNewPassword &&
      Api.Auth.resetPassword({
        id: user.id,
        ...values,
      });
    onOpenChange(false);
  };

  return (
    <Dialog.Root onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Dropdown.MenuItem
          ref={forwardedRef}
          onSelect={(event) => {
            event.preventDefault();
            onSelect && onSelect();
          }}
        >
          Reset password
        </Dropdown.MenuItem>
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            Reset {user.username}'{user.username.slice(-1) !== "s" && "s"}{" "}
            password
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Reset a user's password
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-1"
          >
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="New password..."
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Repeat new password..."
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Dialog.Footer>
              <Button type="submit">Reset</Button>
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog.Root>
  );
});

const EditUserSheet: React.FC<{
  initialUser: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  mutation: UseMutationResult<
    User[],
    Error,
    {
      id: number;
      newUser: Omit<User, "id">;
    }
  >;
  departments: Department[];
}> = ({ initialUser, open, setOpen, mutation, departments }) => {
  // TODO: Match these limits with the db schema
  const editUserSchema = React.useMemo(
    () =>
      Zod.object({
        username: Zod.string()
          .min(2, "Must have a minimum of 2 characters")
          .max(50, "Must be no more than 50 characters"),
        name: Zod.string()
          .min(2, "Must have a minimum of 2 characters")
          .max(128, "Must be no more than 128 characters"),
        description: Zod.string().max(
          250,
          "Must be no more than 250 characters",
        ),
        department: Zod.coerce
          .number()
          .refine(
            (department) => departments.some((e) => e.id === department),
            {
              message: "Cannot find this department. It may have been deleted.",
            },
          )
          .nullable(),
        role: roleSchema,
      }),
    [departments],
  );

  const form = useForm<Zod.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: initialUser.username,
      name: initialUser.name,
      description: initialUser.description,
      role: initialUser.role.toString() as `${Role}`,
      department: initialUser.department,
    },
  });

  const onSubmit = (values: Zod.infer<typeof editUserSchema>) => {
    mutation.mutate({
      id: initialUser.id,
      newUser: {
        name: values.name,
        username: values.username,
        description: values.description,
        department: values.department,
        role: Role[values.role],
      },
    });

    setOpen(false);
  };

  const [charCount, setCharCount] = useState(initialUser.description.length);

  return (
    <Sheet
      open={open}
      onOpenChange={(now) => {
        form.reset();
        setOpen(now);
      }}
    >
      <SheetContent className="w-[600px]">
        <SheetHeader>
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row justify-between text-sm">
                    <span>Description</span>
                    <span
                      className={cn(
                        "text-muted-foreground flex items-center font-normal",
                        charCount > 250 && "text-red-600",
                      )}
                    >
                      {charCount}/250
                      <Lucide.Text className="w-3.5 ml-1" />
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description..."
                      onInput={(event) => {
                        setCharCount(event.currentTarget.value.length);
                      }}
                      className="max-h-[160px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select.Root
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <Select.Trigger>
                        <Select.Value placeholder="Select role..." />
                      </Select.Trigger>
                    </FormControl>
                    <Select.Content>
                      <Select.Group>
                        <Select.Item value="admin">Admin</Select.Item>
                        <Select.Item value="teacher">Teacher</Select.Item>
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                  <FormMessage />
                  <FormDescription>
                    This is a publically visible, cosmetic marker that does not
                    impact a user's permissions
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select.Root
                    onValueChange={(newValue: string) =>
                      field.onChange(newValue === "" ? null : newValue)
                    }
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <Select.Trigger>
                        <Select.Value placeholder="Select department..." />
                      </Select.Trigger>
                    </FormControl>
                    <Select.Content>
                      <Select.Group>
                        {departments.map((department, i) => (
                          <Select.Item key={i} value={department.id.toString()}>
                            {department.department}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

const PermissionsTab: React.FC = () => {
  return <>Permissions</>;
};

export const Route = createLazyFileRoute("/users")({
  component: UsersPage,
});
