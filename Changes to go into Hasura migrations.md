Add these columns to the respective tables, please:

|Table|New column|Type|Default|
|-----|----------|----|---------|
|`challenge`|
||`short_description`|text|`''::text`|
||`long_description`|text|`''::text`|
|`geogebra_worksheet`|
||`short_description`|text|`''::text`|
||`long_description`|text|`''::text`|
|`story`|
||`edit`|jsonb|`'{"state": "specs", "contributors": []}'::jsonb`|
|`story_chapter`|
||`specs`|text|`''::text`|
||`number`|integer|`1`|
||`edit`|jsonb|`'{"warnStorySpecsHaveChanged":false,"warnEpisodeSpecsHaveChanged":false}'::jsonb`|
||`feedback_categories`|jsonb|`'[]'`|
|`story_section`|
||`specs`|text|`''::text`|
||`number`|integer|`1`|
||`title`|text|`''::text`|
||`meta`|jsonb|`'{"mood": {}, "topics": [], "features": [], "challenges": []}'::jsonb`|
||`topic_whitelist`|jsonb|`'[]'`|

We also need new tables `survey`, `survey_question`, `user_feedback`, `topic`. All of them should contain `created_at` and `updated_at` as usual, plus the following columns:

|Table|New column|Type|Default|
|-----|----------|----|---------|
|`survey`|
||`id`|uuid|(newly generated UUID)|
||`story_chapter_id`|uuid|– (non-null FK to `story_chapter` table)|
|`survey_question`|
||`id`|uuid|(newly generated UUID)|
||`survey_id`|uuid|– (non-null FK to `survey` table)|
||`type`|text|`'free'::text`|
||`question`|text|`''::text`|
||`note`|text|`''::text`|
||`number`|integer|`1`|
|`user_feedback`|
||`account_id`|uuid|`NULL` (nullable FK to `account` table)|
||`student_id`|uuid|`NULL` (nullable FK to `student` table)|
||`survey_id`|uuid|– (non-null FK to `survey` table)|
||`feedback`|jsonb|`'{}'::jsonb`|
|`topic`|
||`id`|uuid|(newly generated UUID)|
||`name`|text|`''::text`|
|`subtopic`|
||`id`|uuid|(newly generated UUID)|
||`name`|text|`''::text`|
||`topic_id`|uuid|– (non-null FK to `topic` table)|
|`replica`|
||`id`|uuid|(newly generated UUID)|
||`message`|text|`''::text`|
||`subtopic_id`|uuid|– (non-null FK to `subtopic` table)|
|`reaction`|
||`id`|uuid|(newly generated UUID)|
||`message`|text|`''::text`|
||`subtopic_id`|uuid|– (non-null FK to `subtopic` table)|
||`character_id`|uuid|– (non-null FK to `character` table)|
