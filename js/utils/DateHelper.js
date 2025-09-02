const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default class DateHelper {
  static getDaysDifference(dateString) {
    const dateAdded = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = currentDate - dateAdded;
    return Math.floor(timeDiff / MS_PER_DAY);
  }

  static getDaysAgo(dateString) {
    const days = DateHelper.getDaysDifference(dateString);
    if (days === 0) return "today";
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}