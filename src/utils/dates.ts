import format from "date-fns/format";
import differenceInHours from "date-fns/differenceInHours";
import formatDistance from "date-fns/formatDistance";
import { enUS } from "date-fns/locale";

export function formatDateWithTime(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input);
  const now = new Date();

  const hoursDifference = differenceInHours(now, date);

  if (hoursDifference < 24) {
    return formatDistance(date, now, {
      includeSeconds: true,
      locale: enUS,
      addSuffix: true,
    });
  }

  return format(date, "dd/MM/yyyy HH:mm:ss");
}
