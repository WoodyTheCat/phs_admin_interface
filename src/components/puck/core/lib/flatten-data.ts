import { PuckConfig, UserGenerics } from "../types";

export const flattenData = <
  UserConfig extends PuckConfig = PuckConfig,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>,
>(
  data: G["UserData"],
) => {
  return Object.keys(data.zones || {}).reduce<G["UserComponentData"][]>(
    (acc, zone) => [...acc, ...data.zones![zone]],
    data.content,
  );
};
