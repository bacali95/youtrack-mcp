/**
 * Default `fields` presets, mirrored from the defaults YouTrack itself declares
 * in its OpenAPI spec for each endpoint. Tools expose a `fields` argument that
 * overrides these when a caller needs more (or fewer) properties.
 */
export const FIELDS = {
  issue:
    "$type,created,customFields($type,id,name,value($type,id,name)),description,id,idReadable," +
    "links($type,direction,id,linkType($type,id,localizedName,name)),numberInProject," +
    "project($type,id,name,shortName),reporter($type,id,login,ringId),resolved,summary,updated," +
    "updater($type,id,login,ringId),visibility($type,id,permittedGroups($type,id,name,ringId),permittedUsers($type,id,login,ringId))",
  comment:
    "$type,attachments($type,id),author($type,id,login,ringId),created,deleted,id,text,updated," +
    "visibility($type,id,permittedGroups($type,id,name,ringId),permittedUsers($type,id,login,ringId))",
  link: "$type,direction,id,linkType($type,id,localizedName,name)",
  linkType:
    "$type,aggregation,directed,id,localizedName,localizedSourceToTarget,localizedTargetToSource,name,readOnly,sourceToTarget,targetToSource",
  tag: "$type,id,name,owner($type,id,login,ringId)",
  project: "$type,archived,customFields,id,leader($type,id,login,ringId),name,shortName,description",
  projectCustomField:
    "$type,canBeEmpty,emptyFieldText,field($type,id,name,fieldType($type,id)),id",
  user: "$type,banned,email,fullName,guest,id,login,ringId",
  workItem:
    "$type,author($type,id,login,ringId),created,creator($type,id,login,ringId),date,duration($type,id),id,text,type($type,id,name),updated",
  article:
    "$type,content,created,id,idReadable,parentArticle($type,id,idReadable)," +
    "project($type,id,name,shortName),summary,updated,updatedBy($type,id,login,ringId)",
  agile:
    "$type,id,name,owner($type,id,login,ringId),projects($type,id,name,shortName)," +
    "sprints($type,id,name),currentSprint($type,id,name)",
  sprint: "$type,archived,finish,id,isDefault,name,start,goal",
  savedQuery: "$type,id,name,owner($type,id,login,ringId),query",
  group: "$type,allUsersGroup,id,name,ringId",
  commandList:
    "$type,caret,commands($type,description,error,id),comment,id," +
    "issues($type,id,idReadable,numberInProject),query,suggestions($type,description,option)",
} as const;
