const  db = require ("../models");

const propertiesQueries  = (data, success=f=>f, error=f=>f) => {
  const {id=null,listed_by='1',address=null,title=null, category=null, country=null,state=null,lga=null,district=null,price=null,is_for=null,type=null,description=null,status='listed',polygon=null,point=null,
    size=null,bedrooms='0',bathrooms='0',year_built='0',query_type='select'} = data;
  db.sequelize
    .query(
      `SELECT * FROM  public.__property_queries('${query_type}',:id,:listed_by,:title,:category,:address,:country,:state,:lga,:district,:size,:bedrooms,:bathrooms,:year_built,:price,:is_for,:type,:description,:status,:polygon,:point)`,
      {
        replacements:{
          id:id?id:null,
          listed_by,
          title,
          category,
          address,
          country,
          state,
          lga,
          district,
          size,
          bedrooms:bedrooms?bedrooms:null,
          bathrooms:bedrooms?bedrooms:null,
          year_built:year_built?year_built:null,
          price:price?price:null,
          is_for:is_for?is_for:'SALE',
          type,
          description,
          status:status?status:'listed',
          polygon:polygon?polygon:null,
          point:point?point:null
        }
      }
    )
    .then((results) =>{
      success(results)}
    )
    .catch((err) => {
      console.log(err);
      error(err)});
};

module.exports.getProperties  = (req, res) => {
  propertiesQueries(req.query,(resp)=>res.json({ success: true, data:resp[0]}),
     (error) => res.status(500).json({ success: false, error }));
};

module.exports.postProperties = (req, res) => {
  const { query_type = 'select' } = req.query;
  // console.log(req.body);
  propertiesQueries(
    Object.assign(req.body, { query_type }),
    (data) => {
      console.log({ data });
      req.body.media.forEach((item, idx) => {
        db.sequelize
          .query('SELECT * FROM __property_media(:query_type,:id,:property_id,:mime_type,:file_type,:url,:deleted)', {
            replacements: {
              query_type,
              id: null,
              property_id: `${data[0][0].id}`,
              mime_type: item.mimetype,
              file_type: item.mimetype,
              url: item.path,
              deleted: 'false',
            },
          })
          .then((resp) => {
            if (idx === req.body.media.length - 1) {
              res.json({ success: true, data: data[0] });
            }
            console.log(resp);
          })
          .catch((error) => console.log(error));
      });
    },
    (error) => res.status(500).json({ success: false, error })
  );
};

module.exports.getStateProps  = (req, res) => {
  db.sequelize.query(`SELECT * FROM __properties_by_states()`)
    .then((resp)=>res.json({ success: true, data:resp[0]}))
    .catch((error) => res.status(500).json({ success: false, error }));
};

module.exports.getPropAddress  = (req, res) => {
  db.sequelize.query(`SELECT * FROM __get_property_address('${req.query.polygon}')`)
    .then((resp)=>res.json({ success: true, data:resp[0]}))
    .catch((error) => res.status(500).json({ success: false, error }));
};

