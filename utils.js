exports.convertToWhereClause = queryParams => {
    const queryParamsArr = Object.entries(queryParams),
          whereClause = queryParamsArr.reduce((acc, nextVal, index) => {
            const [property, value] = nextVal;
            // After the first property, the AND delimiter is added prior to every other
            acc += index > 1 ? ` AND ${property}=${value}` : `${property}="${value}"`;
            return acc;
          }, "");

    return whereClause;
}