import axios from 'axios'

export async function search(search: string) {
    const header = {
          headers: {"Access-Control-Allow-Origin": "*"}
      }
    let result = await axios.get(`https://manga-api.onrender.com/search/?t=${ search }`, header)
        .then((res) => { return res })
    return result
}

export async function comics(comics: string) {
    const header = {
          headers: {"Access-Control-Allow-Origin": "*"}
      }
    let result = await axios.get(`https://manga-api.onrender.com/comic/?c=${ comics }`, header)
        .then((res) => { return res })
    return result
}

export async function chapters(chapiters: string) {
    const header = {
          headers: {"Access-Control-Allow-Origin": "*"}
      }
    let result = await axios.get(`https://manga-api.onrender.com/chapters/?c=${ chapiters }`, header)
        .then((res) => { return res })
    return result
}

export async function page(page: string) {
    const header = {
          headers: {"Access-Control-Allow-Origin": "*"}
      }
    let result = await axios.get(`https://manga-api.onrender.com/page/?p=${ page }`, header)
        .then((res) => { return res })
    return result
}

