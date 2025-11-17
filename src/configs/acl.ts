import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability'
import { Rol, Permission, Actions } from 'src/context/types'
import { mergePermissions } from 'src/utils/merged.permissions'

export type Subjects = string

export type ACLObj = {
  action: Actions
  subject: Subjects
}

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export const buildAbilityFor = (roles: Rol[]): AppAbility => {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const allPermissions = roles?.flatMap?.((rol) => rol.permissions);
  const mergedPermission = mergePermissions(allPermissions);

  mergedPermission.forEach((permission) => {
    permission.action.forEach((action) => {
      can(action, permission.subject);
    });
  });

  can('read', 'acl');

  return createMongoAbility(rules);
};

export const defaultACLObj: ACLObj = {
  action: 'read',
  subject: 'acl'
}
