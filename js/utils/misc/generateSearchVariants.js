export function generateSearchVariants(searchTerm) {
    const variants = [searchTerm];
    
    // Handles single quotation mark
    if (searchTerm.includes('’')) {
        variants.push(searchTerm.replace(/'/g, '\''));
    }
    if (searchTerm.includes('\'')) {
        variants.push(searchTerm.replace(/'/g, '’'));
    }
    
    // Handle ellipsis
    variants.forEach(variant => {
        if (variant.includes('...')) {
            variants.push(variant.replace(/\.\.\./g, '…'));
        } else if (variant.includes('…')) {
            variants.push(variant.replace(/…/g, '...'));
        }
    });
    
    return [...new Set(variants)]; // Remove duplicates
}