const moment = require('moment')

module.exports ={
    truncate: (str) => {
        return str.substring(0,75) + '...'
    },
    generateDate : (date,format) => {
      return moment(date).format(format)
    },
    
    paginate : (options) => {
        let outputHTML = ''
        if (!options.hash.current === 1) {
          outputHTML += `
          
          <li class="page-item"><a class="page-link " href="?page=1">First</a></li>
          `
        }
        let i = (Number(options.hash.current ) > 5 ? Number(options.hash.current ) - 3 : 1)
        if (i !== 1) {
          outputHTML += `
          
          <li class="page-item"><a class="page-link disbaled" href="?page=1">...</a></li>
          `
        }
        for (; i <= (Number(options.hash.current ) + 3) && i <= options.hash.pages ; i++){
          if (i===options.hash.current) {
            outputHTML += `
          
          <li class="page-item"><a class="page-link active" >${i}</a></li>
          `
          }else {
            outputHTML += `
          
            <li class="page-item"><a class="page-link " href="?page=${i}">${i}</a></li>
            `
          }
        }
    
        return outputHTML
      }
  
}