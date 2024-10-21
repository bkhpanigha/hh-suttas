export function changeAcronymNumber(acronym, change) {
    return acronym.replace(/(\D+)(\d+)/, (match, p1, p2) => {
      let changedNumber = parseInt(p2, 10) + change;
      return `${p1}${changedNumber}`;
    });
  }