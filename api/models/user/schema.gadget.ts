import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://focuslens.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "jn7K9QJAuja-",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "LrvjV4aDLcyP",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "52kbqitx7OmH",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "LQj442cXmjK0",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "aIa32WLOY-aJ",
    },
    firstName: { type: "string", storageKey: "OkQ-Fzwqoh92" },
    googleImageUrl: { type: "url", storageKey: "QN6Qi603Uhn1" },
    googleProfileId: { type: "string", storageKey: "pplT0UrCBuFB" },
    lastName: { type: "string", storageKey: "phlWp0dPMeoO" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "6KZSJjo_wYGP",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "v_CuZ3i3wu4n",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "jExgLl2h9s0x",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "TB8f88RZ5Osr",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "f2-5gxocIJSg",
    },
  },
};
