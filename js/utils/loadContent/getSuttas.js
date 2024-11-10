export async function getSuttas(db, options, type) {
    let query;

    if (type.includes('en'))
        query = db.suttas_en;
    else
        query = db.suttas_pl;

    query = query.where("sortKey");

    let ids = [];
    if (options.dn) ids.push("1dn");
    if (options.mn) ids.push("2mn");
    if (options.sn) ids.push("3sn");
    if (options.an) ids.push("4an");
    if (options.kn) ids.push("5dhp", "5iti", "5snp", "5thag", "5thig", "5ud");

    query = query.startsWithAnyOf(ids);

    if (options['sn'] && !options['kn']) {
        const validIdRegex = /^(?!SNP)/i;
        query = query.and(sutta => validIdRegex.test(sutta.id));
    }

    return query.toArray();
}