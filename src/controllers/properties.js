const  db = require ("../models");

const propertiesQueries  = (data, success=f=>f, error=f=>f) => {
  const {id=null,listed_by=null,address=null,title=null, category=null, country=null,state=null,lga=null,district=null,price=null,is_for=null,status=null,polygon=null,query_type='select'} = data;
  db.sequelize
    .query(
      `SELECT * FROM  public.__property_queries('${query_type}',:id,:listed_by,:title,:category,:address,:country,:state,:lga,:district,:price,:is_for,:status,:polygon)`,
      {
        replacements:{
          id,listed_by,title,category,address,country,state,lga,district,price,is_for,status,polygon,
        }
      }
    )
    .then((results) =>
      success(results)
    )
    .catch((err) => error(err));
};

module.exports.getProperties  = (req, res) => {
  const { query_type='select'}=req.query
  propertiesQueries(Object.assign(req.body,{query_type})),
      (data)=>res.json({ success: true, data}),
     (error) => res.status(500).json({ success: false, error });
};

module.exports.postProperties  = (req, res) => {
  const { query_type='select'}=req.query
    propertiesQueries(Object.assign(req.body,{query_type})),
      (data)=>res.json({ success: true, data}),
     (error) => res.status(500).json({ success: false, error });
};

module.exports.getStateProps  = (req, res) => {
  db.sequelize.query(`SELECT * FROM __properties_by_states()`)
    .then((resp)=>res.json({ success: true, data:resp[0]}))
    .catch((error) => res.status(500).json({ success: false, error }));
};

