const  db = require ("../models");

const propertiesQueries  = (data, success=f=>f, error=f=>f) => {
  const {id=null,auth_id=null,title=null,category=null,address=null,country=null,state=null,lga=null,district=null,size=null,bedrooms=null,bathrooms=null,year_built=null,price=null,second_price=null,rent_cost=null,is_for=null,floor_area=null,no_of_floors=null,property_type=null,description=null,amenities=null,rent_frequency=null,available_from=null,furnished=null,property_condition=null,parking_spaces=null,status=null,polygon=null,point=null,query_type='select'} = data;
  db.sequelize
    .query(
      `SELECT * FROM  public.__property_queries('${query_type}',:id,:auth_id,:title,:category,:address,:country,:state,:lga,:district,:bedrooms,:bathrooms,:year_built,:price,:second_price,:rent_cost,:is_for,:floor_area,:no_of_floors,:property_type,:description,:amenities,:rent_frequency,:available_from,:furnished,:property_condition,:parking_spaces,:status,:polygon,:point)`,
      {
        replacements:{
          id:id?id:null,
          auth_id,
          title,
          category,
          address,
          country,
          state,
          lga,
          district,
          bedrooms,
          bathrooms,
          year_built,
          price,
          second_price,
          rent_cost,
          is_for,
          floor_area,
          no_of_floors,
          property_type,
          description,
          amenities,
          rent_frequency,
          available_from,
          furnished,
          property_condition,
          parking_spaces,
          status,
          polygon,
          point
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
  propertiesQueries(Object(req.query,{auth_id:req.user.id }),(resp)=>res.json({ success: true, data:resp[0]}),
     (error) => res.status(500).json({ success: false, error }));
};

module.exports.getPubProperties  = (req, res) => {
  propertiesQueries(Object.assign(req.query,{auth_id:null}),(resp)=>res.json({ success: true, data:resp[0]}),
     (error) => res.status(500).json({ success: false, error }));
};

module.exports.postProperties = (req, res) => {
  const { query_type = 'select' } = req.query;
  // console.log(req.body);
  propertiesQueries(
    Object.assign(req.body, { query_type }, {auth_id:req.user.id}),
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

